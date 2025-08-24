import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { AuditService } from './audit.service';
import { TwoFactorService } from './two-factor.service';
import { CreateAdminUserDto, LoginDto, ChangePasswordDto, ResetPasswordDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private redisService: RedisService,
    private auditService: AuditService,
    private twoFactorService: TwoFactorService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.adminUser.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Extract permissions
    const permissions = user.roles.flatMap(userRole =>
      userRole.role.permissions.map(rolePermission => rolePermission.permission.code)
    );

    const { passwordHash, twoFaSecret, ...result } = user;
    return {
      ...result,
      permissions,
      roles: user.roles.map(ur => ur.role),
    };
  }

  async login(loginDto: LoginDto, ip: string, userAgent: string) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    // Check if 2FA is enabled
    if (user.twoFaSecret && !loginDto.twoFactorToken) {
      return {
        requiresTwoFactor: true,
        tempToken: this.generateTempToken(user.id),
      };
    }

    if (user.twoFaSecret && loginDto.twoFactorToken) {
      const isValidToken = await this.twoFactorService.verifyToken(
        user.twoFaSecret,
        loginDto.twoFactorToken
      );
      
      if (!isValidToken) {
        throw new UnauthorizedException('Invalid two-factor authentication token');
      }
    }

    // Generate JWT token
    const payload = {
      sub: user.id,
      email: user.email,
      permissions: user.permissions,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.generateRefreshToken();

    // Store refresh token in Redis
    await this.redisService.setex(
      `refresh_token:${user.id}`,
      7 * 24 * 3600, // 7 days
      refreshToken
    );

    // Update last login
    await this.prisma.adminUser.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Log audit event
    await this.auditService.log({
      adminUserId: user.id,
      action: 'login',
      ip,
      userAgent,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        permissions: user.permissions,
        roles: user.roles,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string, userId: string) {
    const storedToken = await this.redisService.get(`refresh_token:${userId}`);
    
    if (!storedToken || storedToken !== refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.prisma.adminUser.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const permissions = user.roles.flatMap(userRole =>
      userRole.role.permissions.map(rolePermission => rolePermission.permission.code)
    );

    const payload = {
      sub: user.id,
      email: user.email,
      permissions,
    };

    const newAccessToken = this.jwtService.sign(payload);
    const newRefreshToken = this.generateRefreshToken();

    // Update refresh token in Redis
    await this.redisService.setex(
      `refresh_token:${userId}`,
      7 * 24 * 3600,
      newRefreshToken
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(userId: string, ip: string) {
    // Remove refresh token
    await this.redisService.del(`refresh_token:${userId}`);

    // Log audit event
    await this.auditService.log({
      adminUserId: userId,
      action: 'logout',
      ip,
    });
  }

  async createAdminUser(createUserDto: CreateAdminUserDto, createdBy?: string) {
    // Check if user already exists
    const existingUser = await this.prisma.adminUser.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const saltRounds = parseInt(this.configService.get('BCRYPT_ROUNDS', '12'));
    const passwordHash = await bcrypt.hash(createUserDto.password, saltRounds);

    // Create user
    const user = await this.prisma.adminUser.create({
      data: {
        email: createUserDto.email,
        name: createUserDto.name,
        passwordHash,
      },
    });

    // Assign roles if provided
    if (createUserDto.roleIds && createUserDto.roleIds.length > 0) {
      await this.assignRoles(user.id, createUserDto.roleIds);
    }

    // Log audit event
    if (createdBy) {
      await this.auditService.log({
        adminUserId: createdBy,
        action: 'create_admin_user',
        targetType: 'AdminUser',
        targetId: user.id,
        diffJson: { email: user.email, name: user.name },
      });
    }

    const { passwordHash: _, ...result } = user;
    return result;
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto, ip: string) {
    const user = await this.prisma.adminUser.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.passwordHash
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const saltRounds = parseInt(this.configService.get('BCRYPT_ROUNDS', '12'));
    const newPasswordHash = await bcrypt.hash(changePasswordDto.newPassword, saltRounds);

    // Update password
    await this.prisma.adminUser.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    // Invalidate all refresh tokens
    await this.redisService.del(`refresh_token:${userId}`);

    // Log audit event
    await this.auditService.log({
      adminUserId: userId,
      action: 'change_password',
      ip,
    });
  }

  async assignRoles(userId: string, roleIds: string[]) {
    // Remove existing roles
    await this.prisma.adminUserRole.deleteMany({
      where: { adminUserId: userId },
    });

    // Assign new roles
    if (roleIds.length > 0) {
      const roleAssignments = roleIds.map(roleId => ({
        adminUserId: userId,
        roleId,
      }));

      await this.prisma.adminUserRole.createMany({
        data: roleAssignments,
      });
    }
  }

  async setupTwoFactor(userId: string) {
    const user = await this.prisma.adminUser.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const secret = this.twoFactorService.generateSecret();
    const qrCode = await this.twoFactorService.generateQRCode(secret, user.email);

    // Store temp secret (not activated until verified)
    await this.redisService.setex(
      `temp_2fa_secret:${userId}`,
      300, // 5 minutes
      secret
    );

    return {
      secret,
      qrCode,
    };
  }

  async enableTwoFactor(userId: string, token: string) {
    const tempSecret = await this.redisService.get(`temp_2fa_secret:${userId}`);
    
    if (!tempSecret) {
      throw new BadRequestException('No pending two-factor setup found');
    }

    const isValidToken = await this.twoFactorService.verifyToken(tempSecret, token);
    
    if (!isValidToken) {
      throw new BadRequestException('Invalid verification code');
    }

    // Enable 2FA
    await this.prisma.adminUser.update({
      where: { id: userId },
      data: { twoFaSecret: tempSecret },
    });

    // Remove temp secret
    await this.redisService.del(`temp_2fa_secret:${userId}`);

    // Log audit event
    await this.auditService.log({
      adminUserId: userId,
      action: 'enable_2fa',
    });

    return { enabled: true };
  }

  async disableTwoFactor(userId: string, password: string) {
    const user = await this.prisma.adminUser.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid password');
    }

    // Disable 2FA
    await this.prisma.adminUser.update({
      where: { id: userId },
      data: { twoFaSecret: null },
    });

    // Log audit event
    await this.auditService.log({
      adminUserId: userId,
      action: 'disable_2fa',
    });

    return { disabled: true };
  }

  async hasPermission(userId: string, permission: string): Promise<boolean> {
    const user = await this.prisma.adminUser.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return false;
    }

    const permissions = user.roles.flatMap(userRole =>
      userRole.role.permissions.map(rolePermission => rolePermission.permission.code)
    );

    return permissions.includes(permission);
  }

  private generateRefreshToken(): string {
    return this.jwtService.sign(
      { type: 'refresh', random: Math.random() },
      { expiresIn: '30d' }
    );
  }

  private generateTempToken(userId: string): string {
    return this.jwtService.sign(
      { sub: userId, type: 'temp_2fa' },
      { expiresIn: '5m' }
    );
  }
}
