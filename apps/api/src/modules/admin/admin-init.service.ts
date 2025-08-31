import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import * as bcrypt from "bcrypt";

@Injectable()
export class AdminInitService {
  private readonly logger = new Logger(AdminInitService.name);

  constructor(private prisma: PrismaService) {}

  async initializeAdminSystem() {
    try {
      // Check if system is already initialized
      const existingAdmin = await this.prisma.adminUser.findFirst();
      if (existingAdmin) {
        this.logger.log("Admin system already initialized");
        return { message: "Admin system already initialized" };
      }

      // Create default permissions
      const permissions = await this.createDefaultPermissions();

      // Create default roles
      const roles = await this.createDefaultRoles(permissions);

      // Create super admin user
      const adminUser = await this.createSuperAdmin(roles.superAdmin);

      this.logger.log("Admin system initialized successfully");
      return {
        message: "Admin system initialized successfully",
        adminUser: {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
        },
        roles: Object.keys(roles),
        permissions: permissions.length,
      };
    } catch (error) {
      this.logger.error("Failed to initialize admin system:", error);
      throw error;
    }
  }

  private async createDefaultPermissions() {
    const permissionData = [
      // Dashboard
      { code: "dashboard.view", description: "View dashboard" },

      // Content Management
      { code: "content.movies.view", description: "View movies" },
      { code: "content.movies.create", description: "Create movies" },
      { code: "content.movies.update", description: "Update movies" },
      { code: "content.movies.delete", description: "Delete movies" },
      { code: "content.series.view", description: "View series" },
      { code: "content.series.create", description: "Create series" },
      { code: "content.series.update", description: "Update series" },
      { code: "content.series.delete", description: "Delete series" },
      { code: "content.genres.view", description: "View genres" },
      { code: "content.genres.manage", description: "Manage genres" },

      // User Management
      { code: "admin.users.view", description: "View admin users" },
      { code: "admin.users.create", description: "Create admin users" },
      { code: "admin.users.update", description: "Update admin users" },
      { code: "admin.users.delete", description: "Delete admin users" },
      { code: "admin.roles.view", description: "View roles" },
      { code: "admin.roles.manage", description: "Manage roles" },

      // Analytics
      { code: "analytics.view", description: "View analytics" },
      { code: "analytics.export", description: "Export analytics" },

      // Brand & Sponsors
      { code: "brand.manage", description: "Manage brand settings" },
      { code: "sponsors.manage", description: "Manage sponsors" },

      // System
      { code: "system.settings", description: "Manage system settings" },
      { code: "system.audit", description: "View audit logs" },
    ];

    const permissions = [];
    for (const data of permissionData) {
      const permission = await this.prisma.permission.upsert({
        where: { code: data.code },
        update: data,
        create: data,
      });
      permissions.push(permission);
    }

    return permissions;
  }

  private async createDefaultRoles(permissions: any[]) {
    // Super Admin Role
    const superAdmin = await this.prisma.role.upsert({
      where: { name: "Super Admin" },
      update: { description: "Full system access" },
      create: {
        name: "Super Admin",
        description: "Full system access",
      },
    });

    // Content Manager Role
    const contentManager = await this.prisma.role.upsert({
      where: { name: "Content Manager" },
      update: { description: "Manage content and media" },
      create: {
        name: "Content Manager",
        description: "Manage content and media",
      },
    });

    // Moderator Role
    const moderator = await this.prisma.role.upsert({
      where: { name: "Moderator" },
      update: { description: "Moderate content and users" },
      create: {
        name: "Moderator",
        description: "Moderate content and users",
      },
    });

    // Assign permissions to roles
    await this.assignPermissionsToRole(
      superAdmin.id,
      permissions.map((p) => p.id)
    );

    const contentPermissions = permissions.filter(
      (p) => p.code.startsWith("content.") || p.code.startsWith("dashboard.")
    );
    await this.assignPermissionsToRole(
      contentManager.id,
      contentPermissions.map((p) => p.id)
    );

    const moderatorPermissions = permissions.filter(
      (p) =>
        p.code.startsWith("content.") ||
        p.code.startsWith("dashboard.") ||
        p.code === "system.audit"
    );
    await this.assignPermissionsToRole(
      moderator.id,
      moderatorPermissions.map((p) => p.id)
    );

    return { superAdmin, contentManager, moderator };
  }

  private async assignPermissionsToRole(
    roleId: string,
    permissionIds: string[]
  ) {
    for (const permissionId of permissionIds) {
      await this.prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId,
            permissionId,
          },
        },
        update: {},
        create: {
          roleId,
          permissionId,
        },
      });
    }
  }

  private async createSuperAdmin(superAdminRole: any) {
    const passwordHash = await bcrypt.hash("admin", 12);

    const adminUser = await this.prisma.adminUser.create({
      data: {
        id: "admin",
        username: "admin",
        email: "admin@moviesite.com",
        name: "System Administrator",
        passwordHash,
      },
    });

    // Assign super admin role
    await this.prisma.adminUserRole.create({
      data: {
        adminUserId: adminUser.id,
        roleId: superAdminRole.id,
      },
    });

    return adminUser;
  }
}
