/**
 * Controller CRUD dùng chung cho admin: danh sách phân trang / tìm / lọc / sắp xếp, chi tiết, tạo, sửa, xoá, đổi thứ tự; mỗi route gắn @Permissions.
 * Dùng bởi: các controller trong modules/admin (pages, page-sections, blog-posts, blog-categories, menu-items, products,
 * product-categories, roles, permissions, staffs, notifications).
 * Lưu ý: chỉ lọc qua query string (?status=draft) theo các cột getFilterableFields() trả về; mặc định rỗng = không lọc gì,
 * controller nào cần thì override. Tham số ngoài danh sách bị bỏ qua im lặng.
 * Body của create / update khai kiểu generic nên ValidationPipe toàn cục không thấy DTO (TypeScript xoá kiểu lúc chạy):
 * controller con phải truyền class DTO qua `bodyTypes` để body được kiểm tra + lọc field lạ như các route có DTO cụ thể.
 */
import {
  BadRequestException,
  Body,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Type,
  ValidationPipe,
} from '@nestjs/common';
import { BaseService } from './base.service';
import { ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import type { FindManyOptions, FindOneOptions } from 'typeorm';
import { Permissions } from '../decorators/permission.decorator';

const BODY_VALIDATION_PIPE = new ValidationPipe({
  transform: true,
  whitelist: true,
});

export interface CrudBodyTypes<CreateDto, UpdateDto> {
  create: Type<CreateDto>;
  update: Type<UpdateDto>;
}

@ApiBearerAuth()
export class BaseController<
  T,
  CreateDto,
  UpdateDto,
  IdType extends string | number = string | number,
> {
  constructor(
    protected readonly service: BaseService<T, IdType>,
    private readonly entityName: string,
    private readonly bodyTypes: CrudBodyTypes<CreateDto, UpdateDto>,
  ) {}

  private async validateBody<Dto>(
    body: unknown,
    bodyType: Type<Dto>,
  ): Promise<Dto> {
    if (body instanceof bodyType) return body;
    return BODY_VALIDATION_PIPE.transform(body, {
      type: 'body',
      metatype: bodyType,
    });
  }

  protected getFindAllOptions(): FindManyOptions<T> {
    return {};
  }

  protected getFindOneOptions(id: IdType): FindOneOptions<T> {
    return { where: { id } as any };
  }

  protected getSearchFields(): (keyof T)[] {
    return [];
  }

  protected getFilterableFields(): (keyof T)[] {
    return [];
  }

  protected buildSearchWhere?(search: string): any[] | null;

  @Permissions('LIST')
  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    type: String,
    example: '[{"createdAt":"DESC"},{"id":"ASC"}]',
  })
  async findAll(@Query() query: any) {
    const { page = 1, limit = 10, search, orderBy, ...filters } = query;

    let parsedOrderBy;

    try {
      parsedOrderBy = orderBy ? JSON.parse(orderBy) : undefined;
    } catch {
      throw new BadRequestException('orderBy phải là mảng JSON hợp lệ');
    }

    const filterableFields = new Set(this.getFilterableFields().map(String));
    const safeFilters: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(filters)) {
      if (filterableFields.has(key)) safeFilters[key] = value;
    }

    const options = this.getFindAllOptions();

    const customWhere =
      search && this.buildSearchWhere ? this.buildSearchWhere(search) : null;

    if (customWhere) {
      options.where = customWhere;
    }

    return await this.service.paginate(
      options,
      page,
      limit,
      customWhere ? undefined : search,
      customWhere ? [] : this.getSearchFields(),
      safeFilters,
      parsedOrderBy,
    );
  }

  @Permissions('DETAIL')
  @Get(':id')
  @ApiParam({ name: 'id', type: String, description: 'ID của bản ghi' })
  async findOne(@Param('id') id: IdType) {
    return await this.service.findOne(this.getFindOneOptions(id));
  }

  @Permissions('CREATE')
  @Post()
  async create(@Body() dto: CreateDto) {
    const validDto = await this.validateBody(dto, this.bodyTypes.create);
    return await this.service.create(validDto as any);
  }

  @Permissions('UPDATE')
  @Put(':id')
  async update(@Param('id') id: IdType, @Body() dto: UpdateDto) {
    const validDto = await this.validateBody(dto, this.bodyTypes.update);
    return await this.service.update(id, validDto as any);
  }

  @Permissions('DELETE')
  @Delete(':id')
  @ApiParam({ name: 'id', type: String })
  async remove(@Param('id') id: IdType) {
    return await this.service.delete(id);
  }

  @Permissions('SORT')
  @Patch('sort/:id')
  async updateSort(
    @Param('id') id: IdType,
    @Body('sort') sort: number,
  ): Promise<T> {
    return this.service.updateSort(id, sort);
  }
}
