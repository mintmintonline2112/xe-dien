/**
 * Đăng nhập / làm mới / đăng xuất admin và nhân viên bằng cookie JWT, lưu phiên vào bảng refresh token, sửa hồ sơ.
 * Dùng bởi: auth.controller.ts (các API /admin/auth).
 * Lưu ý: refresh token lưu dạng băm SHA-256 và xoay mỗi lần làm mới; token cũ còn được nhận ROTATION_GRACE_MS (2 tab cùng làm mới), quá hạn đó coi như bị lộ và huỷ phiên.
 * Lưu ý: mỗi nhân viên giữ tối đa MAX_SESSIONS_PER_STAFF phiên, phiên sống tối đa MAX_SESSION_AGE_MS kể từ đăng nhập, làm mới thì kiểm lại tài khoản còn kích hoạt; lỗi dọn phiên cũ không được chặn đăng nhập.
 * Lưu ý: quyền trong payload JWT là mảng chuỗi phẳng để cookie dưới giới hạn 4 KB của trình duyệt.
 */
import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { createHash, randomUUID, timingSafeEqual } from 'crypto';
import { Request, Response } from 'express';
import { JwtConfig } from 'src/config/jwt.config';
import { Repository } from 'typeorm';
import { AccountStatus } from 'src/common/enums/account-status.enum';
import { AccountType } from 'src/common/enums/account-type.enum';
import { UAParser } from 'ua-parser-js';
import { RefreshToken } from '../refresh-token/refresh-token.entity';
import { Staff } from '../staffs/staff.entity';
import { StaffLoginDto } from '../staffs/dto/staff-login.dto';
import { StaffsService } from '../staffs/staffs.service';
import { UpdateProfileDto } from '../staffs/dto/update-profile.dto';
import { UploadImageService } from 'src/modules/upload-image/upload-image.service';

const MAX_SESSIONS_PER_STAFF = 10;

const MAX_SESSION_AGE_MS = 30 * 24 * 60 * 60 * 1000;

const ROTATION_GRACE_MS = 10_000;

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function isSameHashConstantTime(a: string, b: string): boolean {
  const left = Buffer.from(a, 'hex');
  const right = Buffer.from(b, 'hex');
  return left.length === right.length && timingSafeEqual(left, right);
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
    private readonly staffsService: StaffsService,

    private readonly uploadImageService: UploadImageService,
  ) {}

  private parseExpiresInToMs(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 7 * 24 * 60 * 60 * 1000;

    const value = parseInt(match[1], 10);
    const unit = match[2];

    const msPerUnit: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return value * msPerUnit[unit];
  }

  private getCookieOptions(maxAge: number) {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge,
    };
  }

  private signAccessToken(payload: any): Promise<string> {
    const jwtConfig = this.configService.getOrThrow<JwtConfig>('jwt');

    return this.jwtService.signAsync(payload, {
      secret: jwtConfig.accessTokenSecret,
      expiresIn: jwtConfig.accessTokenExpiresIn,
    } as JwtSignOptions);
  }

  private signRefreshToken(
    staffId: string,
    sessionId: string,
  ): Promise<string> {
    const jwtConfig = this.configService.getOrThrow<JwtConfig>('jwt');

    return this.jwtService.signAsync({ id: staffId, sid: sessionId }, {
      secret: jwtConfig.refreshTokenSecret,
      expiresIn: jwtConfig.refreshTokenExpiresIn,
    } as JwtSignOptions);
  }

  private async pruneExpiredAndExcessSessions(staffId: string): Promise<void> {
    try {
      await this.refreshTokenRepo
        .createQueryBuilder()
        .delete()
        .where('expiresAt < NOW()')
        .execute();

      const staleSessions = await this.refreshTokenRepo
        .createQueryBuilder('token')
        .select('token.id', 'id')
        .where('token.staff_id = :staffId', { staffId })
        .orderBy('token.createdAt', 'DESC')
        .offset(MAX_SESSIONS_PER_STAFF - 1)
        .limit(100)
        .getRawMany<{ id: number }>();

      if (staleSessions.length) {
        await this.refreshTokenRepo.delete(staleSessions.map((row) => row.id));
      }
    } catch {
      return;
    }
  }

  private async issueSession(staff: Staff, req: Request, res: Response) {
    const jwtConfig = this.configService.getOrThrow<JwtConfig>('jwt');
    const accessMaxAge = this.parseExpiresInToMs(jwtConfig.accessTokenExpiresIn);
    const refreshMaxAge = this.parseExpiresInToMs(
      jwtConfig.refreshTokenExpiresIn,
    );

    const payload = this.buildPayload(staff);
    const sessionId = randomUUID();

    const accessToken = await this.signAccessToken(payload);
    const refreshToken = await this.signRefreshToken(staff.id, sessionId);

    await this.pruneExpiredAndExcessSessions(staff.id);

    const userAgent = req.headers['user-agent'] || '';
    const parser = new UAParser(userAgent);

    await this.refreshTokenRepo.save({
      staff,
      sessionId,
      tokenHash: hashToken(refreshToken),
      previousTokenHash: null,
      rotatedAt: null,
      expiresAt: new Date(Date.now() + refreshMaxAge),
      ipAddress: req.ip,
      userAgent,
      device: parser.getDevice().model || 'PC',
      browser: parser.getBrowser().name || 'Unknown',
      os: parser.getOS().name || 'Unknown',
    });

    res.cookie('accessToken', accessToken, this.getCookieOptions(accessMaxAge));
    res.cookie(
      'refreshToken',
      refreshToken,
      this.getCookieOptions(refreshMaxAge),
    );

    return payload;
  }

  private buildPayload(staff: any) {
    try {
      const rawPermissions = staff.role?.permissions || [];

      const permissions: string[] = rawPermissions.map(
        (permission: any) => permission.code as string,
      );

      const modules = [
        ...new Set(rawPermissions.map((permission: any) => permission.module)),
      ].filter(Boolean);

      return {
        id: staff.id,
        staff_code: staff.staffCode,
        type: staff.type,
        email: staff.email,
        name: staff.name,
        role: {
          id: staff.role.id,
          name: staff.role.name,
        },
        permissions,
        modules,
      };
    } catch {
      throw new Error('Cannot build payload');
    }
  }

  async login(dto: StaffLoginDto, req: Request, res: Response) {
    try {
      const email = dto.email.trim();

      const staff = await this.staffsService.findOne({
        where: { email },
        relations: ['role', 'role.permissions'],
      });

      if (!staff) {
        throw new InternalServerErrorException('Invalid email or password');
      }

      if (staff.status !== AccountStatus.ACTIVE) {
        throw new InternalServerErrorException('Account is not activated');
      }

      if (staff.type !== AccountType.ADMIN) {
        throw new UnauthorizedException('Unauthorized access');
      }

      const isValid = await bcrypt.compare(dto.password, staff.password);

      if (!isValid) {
        throw new InternalServerErrorException('Invalid email or password');
      }

      return { user: await this.issueSession(staff, req, res) };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        error.message || 'An error occurred during login',
      );
    }
  }

  async loginStaff(dto: StaffLoginDto, req: Request, res: Response) {
    try {
      const email = dto.email.trim();

      const staff = await this.staffsService.findOne({
        where: { email },
        relations: ['role', 'role.permissions'],
      });

      if (!staff) {
        throw new InternalServerErrorException('Invalid email or password');
      }

      if (staff.status !== AccountStatus.ACTIVE) {
        throw new InternalServerErrorException('Account is not activated');
      }

      const isValid = await bcrypt.compare(dto.password, staff.password);

      if (!isValid) {
        throw new InternalServerErrorException('Invalid email or password');
      }

      return { user: await this.issueSession(staff, req, res) };
    } catch (error) {
      if (error.message) {
        throw new InternalServerErrorException(error.message);
      }
      throw new InternalServerErrorException('An error occurred during login');
    }
  }

  async refreshToken(req: Request, res: Response) {
    const oldRefreshToken = req.cookies?.refreshToken;

    if (!oldRefreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    try {
      const jwtConfig = this.configService.getOrThrow<JwtConfig>('jwt');

      const accessMaxAge = this.parseExpiresInToMs(
        jwtConfig.accessTokenExpiresIn,
      );
      const refreshMaxAge = this.parseExpiresInToMs(
        jwtConfig.refreshTokenExpiresIn,
      );

      let decoded: { id?: string; sid?: string };
      try {
        decoded = await this.jwtService.verifyAsync(oldRefreshToken, {
          secret: jwtConfig.refreshTokenSecret,
          clockTolerance: 5,
        });
      } catch {
        throw new UnauthorizedException('Session expired');
      }

      if (!decoded?.sid) {
        throw new UnauthorizedException('Invalid session');
      }

      const session = await this.refreshTokenRepo.findOne({
        where: { sessionId: decoded.sid },
        relations: ['staff', 'staff.role', 'staff.role.permissions'],
      });

      if (!session || session.expiresAt < new Date()) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      const now = new Date();

      if (now.getTime() - session.createdAt.getTime() > MAX_SESSION_AGE_MS) {
        await this.refreshTokenRepo.delete(session.id);
        throw new UnauthorizedException('Session expired');
      }

      if (session.staff?.status !== AccountStatus.ACTIVE) {
        await this.refreshTokenRepo.delete(session.id);
        throw new UnauthorizedException('Account is not activated');
      }

      const presentedHash = hashToken(oldRefreshToken);
      const isCurrent = isSameHashConstantTime(session.tokenHash, presentedHash);

      const isWithinRotationGrace =
        !isCurrent &&
        session.previousTokenHash !== null &&
        session.rotatedAt !== null &&
        isSameHashConstantTime(session.previousTokenHash, presentedHash) &&
        now.getTime() - session.rotatedAt.getTime() <= ROTATION_GRACE_MS;

      if (!isCurrent && !isWithinRotationGrace) {
        await this.refreshTokenRepo.delete(session.id);
        throw new UnauthorizedException('Invalid or expired token');
      }

      const newRefreshToken = await this.signRefreshToken(
        session.staff.id,
        session.sessionId,
      );
      const accessToken = await this.signAccessToken(
        this.buildPayload(session.staff),
      );

      session.previousTokenHash = session.tokenHash;
      session.rotatedAt = now;
      session.tokenHash = hashToken(newRefreshToken);
      session.expiresAt = new Date(Date.now() + refreshMaxAge);

      await this.refreshTokenRepo.save(session);

      res.cookie(
        'accessToken',
        accessToken,
        this.getCookieOptions(accessMaxAge),
      );

      res.cookie(
        'refreshToken',
        newRefreshToken,
        this.getCookieOptions(refreshMaxAge),
      );

      return { message: 'Refresh successful' };
    } catch (error) {
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');

      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid session');
    }
  }

  private readSessionIdIgnoringExpiry(refreshToken?: string): string | null {
    if (!refreshToken) return null;
    try {
      const decoded = this.jwtService.decode(refreshToken);
      return decoded?.sid ?? null;
    } catch {
      return null;
    }
  }

  async logout(req: Request, res: Response) {
    const refreshToken = req.cookies?.refreshToken;

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    const sessionId = this.readSessionIdIgnoringExpiry(refreshToken);
    if (sessionId) {
      await this.refreshTokenRepo.delete({ sessionId });
    }

    return { message: 'Logout successful' };
  }

  async getMe(req: Request, res: Response) {
    if (!req.user) {
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      throw new UnauthorizedException('Session expired');
    }

    const staff = await this.staffsService.findOne({
      where: { id: (req.user as { id: string }).id },
    });

    return {
      user: {
        ...req.user,
        avatar: staff?.avatar ?? null,
        phone: staff?.phone ?? null,
      },
    };
  }

  async updateProfile(
    staffId: string,
    dto: UpdateProfileDto,
    file?: Express.Multer.File,
  ) {
    try {
      const staff = await this.staffsService.findOne({
        where: { id: staffId },
      });

      if (!staff) {
        throw new NotFoundException('Staff not found');
      }

      if (file) {
        staff.avatar = await this.uploadImageService.upload(file, 'profile');
      }

      if (dto.name !== undefined) staff.name = dto.name;
      if (dto.phone !== undefined) staff.phone = dto.phone;

      if (dto.password) {
        if (!dto.currentPassword) {
          throw new BadRequestException('Current password is required');
        }

        const isMatch = await bcrypt.compare(
          dto.currentPassword,
          staff.password,
        );

        if (!isMatch) {
          throw new BadRequestException('Current password is incorrect');
        }

        if (dto.password !== dto.confirmPassword) {
          throw new BadRequestException('Password confirmation does not match');
        }

        staff.password = await bcrypt.hash(dto.password, 10);
      }

      await this.staffsService.update(staffId, staff);

      return {
        message: 'Profile updated successfully',
        user: {
          id: staff.id,
          name: staff.name,
          email: staff.email,
          avatar: staff.avatar,
          phone: staff.phone,
        },
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        error?.message || 'An error occurred while updating the profile',
      );
    }
  }
}
