/**
 * Service CRUD dùng chung: tạo / sửa (trong transaction), xoá mềm, phân trang có tìm kiếm + lọc + sắp xếp, xuất Excel.
 * Dùng bởi: base.controller.ts, các service trong modules/admin, modules/client/blog-posts/blog-posts.service.ts.
 * Lưu ý: paginate gộp điều kiện theo thứ tự filter → search → where gốc của service; gốc luôn thắng nên `?status=draft`
 * không lật được `status = PUBLISHED` của danh sách public. Filter theo cột không có thật bị bỏ qua (trước đây TypeORM ném 500).
 * Filter cột boolean nhận chuỗi query 'true' / 'false' / '1' / '0' và đổi sang boolean (so 'true' với cột tinyint luôn ra 0 dòng).
 * exportToExcel: field `true` = lấy, tự đặt tiêu đề; chuỗi = lấy, dùng chuỗi làm tiêu đề; false / bỏ trống = không lấy.
 */
import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  DeepPartial,
  EntityManager,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  ILike,
  Repository,
} from 'typeorm';
import ExcelJS from 'exceljs';

export type ExportFieldConfig<E extends object> = {
  [K in keyof E]?: boolean | string;
};

export class BaseService<
  T extends { id?: IdType; deletedAt?: Date | null },
  IdType extends string | number = string | number,
> {
  constructor(protected readonly repo: Repository<T>) {}

  async updateSort(id: IdType, sort: unknown): Promise<T> {
    const parsedSort = Number(sort);

    if (!Number.isInteger(parsedSort)) {
      throw new BadRequestException('Thứ tự sắp xếp phải là số nguyên');
    }

    if (parsedSort < 1) {
      throw new BadRequestException('Thứ tự sắp xếp phải từ 1 trở lên');
    }

    const entity = await this.repo.findOne({
      where: { id } as any,
    });

    if (!entity) {
      throw new NotFoundException('Không tìm thấy dữ liệu');
    }

    if (!('sort' in entity) && !('sortOrder' in entity)) {
      throw new BadRequestException('Dữ liệu này không hỗ trợ sắp xếp');
    }

    if ('sortOrder' in entity) {
      (entity as any).sortOrder = parsedSort;
    } else {
      (entity as any).sort = parsedSort;
    }

    return await this.repo.save(entity);
  }

  async create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repo.create(data);
    return await this.repo.save(entity);
  }

  async createMany(
    data: DeepPartial<T>[],
    manager?: EntityManager,
  ): Promise<T[]> {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return [];
    }
    const repo = manager
      ? manager.getRepository<T>(this.repo.target)
      : this.repo;

    const entities = repo.create(data);

    if (manager) {
      return await repo.save(entities);
    }

    return await this.repo.manager.transaction(async (transactionManager) => {
      const transactionRepo = transactionManager.getRepository<T>(
        this.repo.target,
      );
      return await transactionRepo.save(entities);
    });
  }

  async update(
    id: IdType,
    data: DeepPartial<T>,
    manager?: EntityManager,
  ): Promise<T> {
    const repo = manager
      ? manager.getRepository<T>(this.repo.target)
      : this.repo;

    const entity = await repo.findOne({
      where: { id } as any,
    });

    if (!entity) {
      throw new NotFoundException(`Không tìm thấy dữ liệu có id ${id}`);
    }

    const updatedEntity = repo.merge(entity, data);

    if (manager) {
      return await repo.save(updatedEntity);
    }

    return await this.repo.manager.transaction(async (transactionManager) => {
      const transactionRepo = transactionManager.getRepository<T>(
        this.repo.target,
      );
      return await transactionRepo.save(updatedEntity);
    });
  }

  async delete(id: IdType): Promise<any> {
    const whereCondition = { id } as FindOptionsWhere<T>;

    const entity = await this.repo.findOne({
      where: whereCondition,
      withDeleted: true,
    });

    if (!entity) {
      throw new NotFoundException(`Không tìm thấy dữ liệu có id ${id}`);
    }

    if ('deletedAt' in entity) {
      await this.repo.update(id, {
        deletedAt: new Date(),
      } as unknown as import('typeorm').QueryDeepPartialEntity<T>);
      return { id, softDeleted: true };
    } else {
      await this.repo.delete(id);
      return { id, hardDeleted: true };
    }
  }

  async findOne(options: FindOneOptions<T>): Promise<T | null> {
    return await this.repo.findOne(options);
  }

  async find(options?: FindManyOptions<T>): Promise<T[]> {
    return await this.repo.find(options);
  }

  async paginate(
    options: FindManyOptions<T> = {},
    page = 1,
    limit = 10,
    search?: string,
    searchFields: (keyof T)[] = [],
    filters: Record<string, any> = {},
    orderBy?: Partial<Record<keyof T, 'ASC' | 'DESC' | 'asc' | 'desc'>>[],
  ): Promise<{
    data: T[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    page = Number(page);
    limit = Number(limit);

    if (!Number.isInteger(page) || page < 1) {
      throw new BadRequestException('Số trang phải là số nguyên dương');
    }

    if (!Number.isInteger(limit) || limit < 1 || limit > 1000) {
      throw new BadRequestException('Số dòng mỗi trang phải từ 1 đến 1000');
    }

    let whereConditions: FindOptionsWhere<T>[] = [];

    const filterCondition = this.applyFilters(filters);
    const searchConditions = this.applySearch(search, searchFields);

    const baseConditions = options.where
      ? Array.isArray(options.where)
        ? options.where
        : [options.where]
      : [{}];

    whereConditions = baseConditions.flatMap((baseCondition) => {
      if (!searchConditions) {
        return [{ ...filterCondition, ...baseCondition }];
      }

      return searchConditions.map((searchCondition) => ({
        ...filterCondition,
        ...searchCondition,
        ...baseCondition,
      }));
    });

    options.where = whereConditions;

    const order: any = {};

    if (orderBy && orderBy.length > 0) {
      const sortableColumns = this.getColumnNames();
      for (const item of orderBy) {
        if (!item || typeof item !== 'object') {
          throw new BadRequestException('orderBy phải là mảng các object');
        }
        for (const key in item) {
          if (!sortableColumns.has(key)) {
            throw new BadRequestException(
              `Không sắp xếp được theo cột không tồn tại "${key}"`,
            );
          }
          const direction = String(item[key]).toUpperCase();
          if (direction !== 'ASC' && direction !== 'DESC') {
            throw new BadRequestException(
              `Chiều sắp xếp của "${key}" phải là ASC hoặc DESC`,
            );
          }
          order[key] = direction;
        }
      }
    } else {
      order['createdAt'] = 'DESC';
    }

    const [data, total] = await this.repo.findAndCount({
      ...options,
      order,
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  protected getColumnNames(): Set<string> {
    return new Set(
      this.repo.metadata.columns.map((column) => column.propertyName),
    );
  }

  protected isBooleanColumn(propertyName: string): boolean {
    const column = this.repo.metadata.columns.find(
      (candidate) => candidate.propertyName === propertyName,
    );
    if (!column) return false;
    const type = column.type;
    return (
      type === Boolean ||
      type === 'boolean' ||
      type === 'bool' ||
      (type === 'tinyint' && Number(column.width) === 1)
    );
  }

  protected toFilterValue(propertyName: string, value: unknown): unknown {
    if (typeof value !== 'string' || !this.isBooleanColumn(propertyName)) {
      return value;
    }
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true' || normalized === '1') return true;
    if (normalized === 'false' || normalized === '0') return false;
    return value;
  }

  protected applyFilters(filters: Record<string, any>): FindOptionsWhere<T> {
    const condition: any = {};
    const columns = this.getColumnNames();

    Object.keys(filters).forEach((key) => {
      if (!columns.has(key)) return;
      const value = filters[key];
      if (value !== undefined && value !== null && value !== '') {
        condition[key] = this.toFilterValue(key, value);
      }
    });

    return condition as FindOptionsWhere<T>;
  }

  protected applySearch(
    search?: string,
    searchFields: (keyof T)[] = [],
  ): FindOptionsWhere<T>[] | null {
    if (!search || searchFields.length === 0) return null;

    return searchFields.map(
      (field) =>
        ({
          [field]: ILike(`%${search}%`),
        }) as FindOptionsWhere<T>,
    );
  }

  async exportToExcel<E extends object>(
    data: E[],
    fields: ExportFieldConfig<E>,
    sheetName = 'Export',
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(sheetName);

    const columns = Object.entries(fields)
      .filter(
        ([, headerConfig]) => headerConfig !== false && headerConfig != null,
      )
      .map(([key, headerConfig]) => ({
        key,
        header:
          typeof headerConfig === 'string'
            ? headerConfig
            : this.formatExcelHeader(key),
      }));

    sheet.columns = columns.map((column) => ({
      header: column.header,
      key: column.key,
      width: 22,
    }));
    sheet.getRow(1).font = { bold: true };

    for (const row of data) {
      const cells: Record<string, any> = {};
      for (const column of columns) {
        const cellValue = (row as any)[column.key];
        cells[column.key] = cellValue == null ? '' : cellValue;
      }
      sheet.addRow(cells);
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  private formatExcelHeader(key: string): string {
    return key
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }
}
