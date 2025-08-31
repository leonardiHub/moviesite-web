import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger";

import { AdminService } from "./admin.service";
import { RoleService } from "./role.service";
import { PermissionService } from "./permission.service";
import { RbacGuard, RequirePermissions } from "../auth/guards/rbac.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { AuditService } from "../auth/audit.service";
import { PERMISSIONS } from "../../constants/permissions";
import { AdminInitService } from "./admin-init.service";
import { AdminAuthService } from "./admin-auth.service";
import { PrismaService } from "../prisma/prisma.service";

@ApiTags("Admin Management")
@Controller("admin")
export class AdminController {
  constructor(
    private adminService: AdminService,
    private roleService: RoleService,
    private permissionService: PermissionService,
    private auditService: AuditService,
    private adminInitService: AdminInitService,
    private adminAuthService: AdminAuthService,
    private prisma: PrismaService
  ) {}

  // Admin Users
  @Get("users")
  @UseGuards(AuthGuard("jwt"))
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.ADMIN_USERS_VIEW)
  @ApiOperation({ summary: "Get all admin users" })
  @ApiQuery({ name: "search", required: false })
  @ApiQuery({ name: "roleId", required: false })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  async getAdminUsers(
    @Query("search") search?: string,
    @Query("roleId") roleId?: string,
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query("limit", new DefaultValuePipe(20), ParseIntPipe) limit: number = 20
  ) {
    return this.adminService.findAll({ search, roleId, page, limit });
  }

  @Get("users/:id")
  @UseGuards(AuthGuard("jwt"))
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.ADMIN_USERS_VIEW)
  @ApiOperation({ summary: "Get admin user by ID" })
  async getAdminUser(@Param("id") id: string) {
    return this.adminService.findOne(id);
  }

  @Post("users")
  @UseGuards(AuthGuard("jwt"))
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.ADMIN_USERS_CREATE)
  @ApiOperation({ summary: "Create admin user" })
  async createAdminUser(
    @Body()
    createUserDto: {
      username: string;
      email: string;
      name: string;
      password: string;
      roleIds?: string[];
    },
    @CurrentUser("userId") currentUserId: string
  ) {
    const result = await this.adminService.create(createUserDto);

    // Log audit event
    await this.auditService.log({
      adminUserId: currentUserId,
      action: "create_admin_user",
      targetType: "AdminUser",
      targetId: result.id,
      diffJson: {
        username: result.username,
        email: result.email,
        name: result.name,
      },
    });

    return result;
  }

  @Put("users/:id")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.ADMIN_USERS_UPDATE)
  @ApiOperation({ summary: "Update admin user" })
  async updateAdminUser(
    @Param("id") id: string,
    @Body()
    updateUserDto: {
      email?: string;
      name?: string;
      password?: string;
      roleIds?: string[];
    },
    @CurrentUser("userId") currentUserId: string
  ) {
    const result = await this.adminService.update(id, updateUserDto);

    // Log audit event
    await this.auditService.log({
      adminUserId: currentUserId,
      action: "update_admin_user",
      targetType: "AdminUser",
      targetId: id,
      diffJson: updateUserDto,
    });

    return result;
  }

  @Delete("users/:id")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.ADMIN_USERS_DELETE)
  @ApiOperation({ summary: "Delete admin user" })
  async deleteAdminUser(
    @Param("id") id: string,
    @CurrentUser("userId") currentUserId: string
  ) {
    const result = await this.adminService.delete(id);

    // Log audit event
    await this.auditService.log({
      adminUserId: currentUserId,
      action: "delete_admin_user",
      targetType: "AdminUser",
      targetId: id,
    });

    return result;
  }

  @Get("users/stats")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.ADMIN_USERS_VIEW)
  @ApiOperation({ summary: "Get admin users statistics" })
  async getAdminStats() {
    return this.adminService.getStats();
  }

  // Roles
  @Get("roles")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.ROLES_VIEW)
  @ApiOperation({ summary: "Get all roles" })
  async getRoles() {
    return this.roleService.findAll();
  }

  @Get("roles/:id")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.ROLES_VIEW)
  @ApiOperation({ summary: "Get role by ID" })
  async getRole(@Param("id") id: string) {
    return this.roleService.findOne(id);
  }

  @Post("roles")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.ROLES_CREATE)
  @ApiOperation({ summary: "Create role" })
  async createRole(
    @Body()
    createRoleDto: {
      name: string;
      description?: string;
      permissionIds?: string[];
    },
    @CurrentUser("userId") currentUserId: string
  ) {
    const result = await this.roleService.create(createRoleDto);

    // Log audit event
    await this.auditService.log({
      adminUserId: currentUserId,
      action: "create_role",
      targetType: "Role",
      targetId: result.id,
      diffJson: { name: result.name, description: result.description },
    });

    return result;
  }

  @Put("roles/:id")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.ROLES_UPDATE)
  @ApiOperation({ summary: "Update role" })
  async updateRole(
    @Param("id") id: string,
    @Body()
    updateRoleDto: {
      name?: string;
      description?: string;
      permissionIds?: string[];
    },
    @CurrentUser("userId") currentUserId: string
  ) {
    const result = await this.roleService.update(id, updateRoleDto);

    // Log audit event
    await this.auditService.log({
      adminUserId: currentUserId,
      action: "update_role",
      targetType: "Role",
      targetId: id,
      diffJson: updateRoleDto,
    });

    return result;
  }

  @Delete("roles/:id")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.ROLES_DELETE)
  @ApiOperation({ summary: "Delete role" })
  async deleteRole(
    @Param("id") id: string,
    @CurrentUser("userId") currentUserId: string
  ) {
    const result = await this.roleService.delete(id);

    // Log audit event
    await this.auditService.log({
      adminUserId: currentUserId,
      action: "delete_role",
      targetType: "Role",
      targetId: id,
    });

    return result;
  }

  @Get("roles/permissions/matrix")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.ROLES_VIEW)
  @ApiOperation({ summary: "Get role permission matrix" })
  async getPermissionMatrix() {
    return this.roleService.getPermissionMatrix();
  }

  // Permissions
  @Get("permissions")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.ROLES_VIEW)
  @ApiOperation({ summary: "Get all permissions" })
  async getPermissions() {
    return this.permissionService.findAll();
  }

  @Get("permissions/:id")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.ROLES_VIEW)
  @ApiOperation({ summary: "Get permission by ID" })
  async getPermission(@Param("id") id: string) {
    return this.permissionService.findOne(id);
  }

  @Post("permissions")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.ROLES_CREATE)
  @ApiOperation({ summary: "Create permission" })
  async createPermission(
    @Body()
    createPermissionDto: {
      code: string;
      description?: string;
    },
    @CurrentUser("userId") currentUserId: string
  ) {
    const result = await this.permissionService.create(createPermissionDto);

    // Log audit event
    await this.auditService.log({
      adminUserId: currentUserId,
      action: "create_permission",
      targetType: "Permission",
      targetId: result.id,
      diffJson: { code: result.code, description: result.description },
    });

    return result;
  }

  @Put("permissions/:id")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.ROLES_UPDATE)
  @ApiOperation({ summary: "Update permission" })
  async updatePermission(
    @Param("id") id: string,
    @Body()
    updatePermissionDto: {
      code?: string;
      description?: string;
    },
    @CurrentUser("userId") currentUserId: string
  ) {
    const result = await this.permissionService.update(id, updatePermissionDto);

    // Log audit event
    await this.auditService.log({
      adminUserId: currentUserId,
      action: "update_permission",
      targetType: "Permission",
      targetId: id,
      diffJson: updatePermissionDto,
    });

    return result;
  }

  @Delete("permissions/:id")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.ROLES_DELETE)
  @ApiOperation({ summary: "Delete permission" })
  async deletePermission(
    @Param("id") id: string,
    @CurrentUser("userId") currentUserId: string
  ) {
    const result = await this.permissionService.delete(id);

    // Log audit event
    await this.auditService.log({
      adminUserId: currentUserId,
      action: "delete_permission",
      targetType: "Permission",
      targetId: id,
    });

    return result;
  }

  // System initialization
  @Post("system/init-permissions")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.ROLES_CREATE)
  @ApiOperation({ summary: "Initialize default permissions" })
  async initializePermissions(@CurrentUser("userId") currentUserId: string) {
    const result = await this.permissionService.initializeDefaultPermissions();

    // Log audit event
    await this.auditService.log({
      adminUserId: currentUserId,
      action: "init_permissions",
      diffJson: result,
    });

    return result;
  }

  @Post("system/init-roles")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.ROLES_CREATE)
  @ApiOperation({ summary: "Initialize default roles" })
  async initializeRoles(@CurrentUser("userId") currentUserId: string) {
    const result = await this.permissionService.initializeDefaultRoles();

    // Log audit event
    await this.auditService.log({
      adminUserId: currentUserId,
      action: "init_roles",
      diffJson: result,
    });

    return result;
  }

  @Post("system/init-admin")
  @ApiOperation({ summary: "Initialize default admin user (public endpoint)" })
  async initializeDefaultAdmin() {
    return this.adminService.initializeDefaultAdmin();
  }

  // Public system initialization (no auth required)
  @Post("system/init")
  @ApiOperation({
    summary: "Initialize complete admin system (public endpoint)",
  })
  async initializeSystem() {
    return this.adminInitService.initializeAdminSystem();
  }

  // Admin Authentication (public endpoints)
  @Post("auth/login")
  @ApiOperation({ summary: "Admin login" })
  async login(@Body() loginDto: { username: string; password: string }) {
    return this.adminAuthService.login(loginDto.username, loginDto.password);
  }

  @Post("auth/refresh")
  @ApiOperation({ summary: "Refresh admin token" })
  async refreshToken(@Body() refreshDto: { refreshToken: string }) {
    return this.adminAuthService.refreshToken(refreshDto.refreshToken);
  }

  // Test endpoint
  @Get("test")
  @ApiOperation({ summary: "Test endpoint" })
  async test() {
    return {
      message: "Admin controller is working",
      timestamp: new Date().toISOString(),
    };
  }

  // Simple login test endpoint
  @Post("auth/login-test")
  @ApiOperation({ summary: "Simple admin login test" })
  async loginTest(@Body() loginDto: { username: string; password: string }) {
    try {
      // Simple test without complex Prisma query
      const admin = await this.prisma.adminUser.findUnique({
        where: { username: loginDto.username },
      });

      if (!admin) {
        return { error: "User not found" };
      }

      return {
        message: "Simple login test successful",
        user: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          name: admin.name,
        },
      };
    } catch (error) {
      return {
        error: "Login test failed",
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      };
    }
  }

  // Very simple test endpoint
  @Get("simple-test")
  @ApiOperation({ summary: "Very simple test endpoint" })
  async simpleTest() {
    return {
      message: "Very simple test endpoint working",
      timestamp: new Date().toISOString(),
      test: "This endpoint should work without any dependencies",
    };
  }

  @Get("auth/profile")
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get admin profile" })
  async getProfile(@CurrentUser("userId") adminId: string) {
    return this.adminAuthService.getProfile(adminId);
  }
}
