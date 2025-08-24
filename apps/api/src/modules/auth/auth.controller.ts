import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Put,
  Delete,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  Ip,
  Headers,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { AuthService } from './auth.service';
import { AuditService } from './audit.service';
import { TwoFactorService } from './two-factor.service';
import { RbacGuard, RequirePermissions } from './guards/rbac.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import {
  LoginDto,
  CreateAdminUserDto,
  ChangePasswordDto,
  ResetPasswordRequestDto,
  ResetPasswordDto,
} from './dto';
import { PERMISSIONS } from '../../constants/permissions';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private auditService: AuditService,
    private twoFactorService: TwoFactorService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Admin login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
  async login(
    @Body() loginDto: LoginDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.authService.login(loginDto, ip, userAgent);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(@Body() { refreshToken, userId }: { refreshToken: string; userId: string }) {
    return this.authService.refreshToken(refreshToken, userId);
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  async logout(@CurrentUser('userId') userId: string, @Ip() ip: string) {
    await this.authService.logout(userId, ip);
    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user info' })
  @ApiResponse({ status: 200, description: 'User info retrieved' })
  async getMe(@CurrentUser() user: any) {
    return {
      id: user.userId,
      email: user.email,
      name: user.name,
      permissions: user.permissions,
      roles: user.roles,
    };
  }

  @Put('change-password')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid current password' })
  async changePassword(
    @CurrentUser('userId') userId: string,
    @Body() changePasswordDto: ChangePasswordDto,
    @Ip() ip: string,
  ) {
    await this.authService.changePassword(userId, changePasswordDto, ip);
    return { message: 'Password changed successfully' };
  }

  // Two-Factor Authentication
  @Post('2fa/setup')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Setup two-factor authentication' })
  @ApiResponse({ status: 200, description: '2FA setup initiated' })
  async setupTwoFactor(@CurrentUser('userId') userId: string) {
    return this.authService.setupTwoFactor(userId);
  }

  @Post('2fa/enable')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enable two-factor authentication' })
  @ApiResponse({ status: 200, description: '2FA enabled successfully' })
  @ApiResponse({ status: 400, description: 'Invalid verification code' })
  async enableTwoFactor(
    @CurrentUser('userId') userId: string,
    @Body() { token }: { token: string },
  ) {
    return this.authService.enableTwoFactor(userId, token);
  }

  @Delete('2fa/disable')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Disable two-factor authentication' })
  @ApiResponse({ status: 200, description: '2FA disabled successfully' })
  @ApiResponse({ status: 400, description: 'Invalid password' })
  async disableTwoFactor(
    @CurrentUser('userId') userId: string,
    @Body() { password }: { password: string },
  ) {
    return this.authService.disableTwoFactor(userId, password);
  }

  // Admin User Management
  @Post('admin/users')
  @UseGuards(AuthGuard('jwt'), RbacGuard)
  @RequirePermissions(PERMISSIONS.ADMIN_USERS_CREATE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create admin user' })
  @ApiResponse({ status: 201, description: 'Admin user created successfully' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async createAdminUser(
    @Body() createUserDto: CreateAdminUserDto,
    @CurrentUser('userId') createdBy: string,
  ) {
    return this.authService.createAdminUser(createUserDto, createdBy);
  }

  @Put('admin/users/:userId/roles')
  @UseGuards(AuthGuard('jwt'), RbacGuard)
  @RequirePermissions(PERMISSIONS.ADMIN_USERS_UPDATE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign roles to admin user' })
  @ApiResponse({ status: 200, description: 'Roles assigned successfully' })
  async assignRoles(
    @CurrentUser('userId') currentUserId: string,
    @Body() { userId, roleIds }: { userId: string; roleIds: string[] },
  ) {
    await this.authService.assignRoles(userId, roleIds);
    
    // Log audit event
    await this.auditService.log({
      adminUserId: currentUserId,
      action: 'assign_roles',
      targetType: 'AdminUser',
      targetId: userId,
      diffJson: { roleIds },
    });

    return { message: 'Roles assigned successfully' };
  }

  // Audit Logs
  @Get('audit')
  @UseGuards(AuthGuard('jwt'), RbacGuard)
  @RequirePermissions(PERMISSIONS.AUDIT_VIEW)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get audit logs' })
  @ApiResponse({ status: 200, description: 'Audit logs retrieved' })
  async getAuditLogs(
    @Query('adminUserId') adminUserId?: string,
    @Query('action') action?: string,
    @Query('targetType') targetType?: string,
    @Query('targetId') targetId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number = 50,
  ) {
    const filters = {
      adminUserId,
      action,
      targetType,
      targetId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      page,
      limit,
    };

    return this.auditService.getAuditLogs(filters);
  }

  @Get('audit/stats')
  @UseGuards(AuthGuard('jwt'), RbacGuard)
  @RequirePermissions(PERMISSIONS.AUDIT_VIEW)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get audit statistics' })
  @ApiResponse({ status: 200, description: 'Audit stats retrieved' })
  async getAuditStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.auditService.getAuditStats(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  // Health check
  @Get('health')
  @ApiOperation({ summary: 'Authentication health check' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async healthCheck() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'auth',
    };
  }
}
