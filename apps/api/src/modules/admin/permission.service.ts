import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PERMISSIONS } from '../../constants/permissions';

// Temporary DEFAULT_ROLES for M1 verification
const DEFAULT_ROLES = {
  SUPER_ADMIN: {
    name: 'Super Admin',
    description: 'Full system access',
    permissions: Object.values(PERMISSIONS),
  },
  CONTENT_MANAGER: {
    name: 'Content Manager',
    description: 'Manages movies, series, and content',
    permissions: [
      PERMISSIONS.DASHBOARD_VIEW,
      PERMISSIONS.CONTENT_MOVIES_VIEW,
      PERMISSIONS.CONTENT_MOVIES_CREATE,
      PERMISSIONS.CONTENT_MOVIES_UPDATE,
      PERMISSIONS.CONTENT_MOVIES_DELETE,
      PERMISSIONS.ANALYTICS_VIEW,
    ],
  },
} as const;

@Injectable()
export class PermissionService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.permission.findMany({
      include: {
        _count: {
          select: {
            roles: true,
          },
        },
      },
      orderBy: { code: 'asc' },
    });
  }

  async findOne(id: string) {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    return {
      ...permission,
      roles: permission.roles.map(rp => rp.role),
    };
  }

  async create(data: {
    code: string;
    description?: string;
  }) {
    // Check if permission already exists
    const existingPermission = await this.prisma.permission.findUnique({
      where: { code: data.code },
    });

    if (existingPermission) {
      throw new ConflictException('Permission with this code already exists');
    }

    return this.prisma.permission.create({
      data: {
        code: data.code,
        description: data.description,
      },
    });
  }

  async update(id: string, data: {
    code?: string;
    description?: string;
  }) {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    const updateData: any = {};

    if (data.code && data.code !== permission.code) {
      // Check if code is already taken
      const existingPermission = await this.prisma.permission.findUnique({
        where: { code: data.code },
      });

      if (existingPermission) {
        throw new ConflictException('Permission code is already taken');
      }

      updateData.code = data.code;
    }

    if (data.description !== undefined) {
      updateData.description = data.description;
    }

    return this.prisma.permission.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string) {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            roles: true,
          },
        },
      },
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    if (permission._count.roles > 0) {
      throw new ConflictException('Cannot delete permission that is assigned to roles');
    }

    await this.prisma.permission.delete({
      where: { id },
    });

    return { message: 'Permission deleted successfully' };
  }

  async initializeDefaultPermissions() {
    const existingPermissions = await this.prisma.permission.findMany();
    const existingCodes = existingPermissions.map(p => p.code);

    // Create missing permissions
    const missingPermissions = Object.values(PERMISSIONS).filter(
      code => !existingCodes.includes(code)
    );

    if (missingPermissions.length > 0) {
      const permissionsToCreate = missingPermissions.map(code => ({
        code,
        description: this.getPermissionDescription(code),
      }));

      await this.prisma.permission.createMany({
        data: permissionsToCreate,
      });
    }

    return {
      created: missingPermissions.length,
      total: Object.values(PERMISSIONS).length,
    };
  }

  async initializeDefaultRoles() {
    const allPermissions = await this.prisma.permission.findMany();
    const permissionMap = new Map(allPermissions.map(p => [p.code, p.id]));

    for (const [roleName, roleConfig] of Object.entries(DEFAULT_ROLES)) {
      const existingRole = await this.prisma.role.findUnique({
        where: { name: roleConfig.name },
      });

      if (!existingRole) {
        // Create role
        const role = await this.prisma.role.create({
          data: {
            name: roleConfig.name,
            description: roleConfig.description,
          },
        });

        // Assign permissions
        const validPermissionIds = roleConfig.permissions
          .map(permissionCode => permissionMap.get(permissionCode))
          .filter(id => id !== undefined);

        if (validPermissionIds.length > 0) {
          const rolePermissions = validPermissionIds.map(permissionId => ({
            roleId: role.id,
            permissionId: permissionId!,
          }));

          await this.prisma.rolePermission.createMany({
            data: rolePermissions,
          });
        }
      }
    }

    return {
      message: 'Default roles initialized',
      roles: Object.keys(DEFAULT_ROLES),
    };
  }

  private getPermissionDescription(code: string): string {
    const descriptions: Record<string, string> = {
      [PERMISSIONS.DASHBOARD_VIEW]: 'View admin dashboard',
      [PERMISSIONS.CONTENT_MOVIES_VIEW]: 'View movies',
      [PERMISSIONS.CONTENT_MOVIES_CREATE]: 'Create movies',
      [PERMISSIONS.CONTENT_MOVIES_UPDATE]: 'Update movies',
      [PERMISSIONS.CONTENT_MOVIES_DELETE]: 'Delete movies',
      [PERMISSIONS.CONTENT_SERIES_VIEW]: 'View series',
      [PERMISSIONS.CONTENT_SERIES_CREATE]: 'Create series',
      [PERMISSIONS.CONTENT_SERIES_UPDATE]: 'Update series',
      [PERMISSIONS.CONTENT_SERIES_DELETE]: 'Delete series',
      [PERMISSIONS.ANALYTICS_VIEW]: 'View analytics',
      [PERMISSIONS.ANALYTICS_EXPORT]: 'Export analytics data',
      [PERMISSIONS.BRAND_VIEW]: 'View brand settings',
      [PERMISSIONS.BRAND_UPDATE]: 'Update brand settings',
      [PERMISSIONS.SPONSORS_VIEW]: 'View sponsors',
      [PERMISSIONS.SPONSORS_CREATE]: 'Create sponsors',
      [PERMISSIONS.SPONSORS_UPDATE]: 'Update sponsors',
      [PERMISSIONS.SPONSORS_DELETE]: 'Delete sponsors',
      [PERMISSIONS.USERS_VIEW]: 'View users',
      [PERMISSIONS.USERS_UPDATE]: 'Update users',
      [PERMISSIONS.USERS_BAN]: 'Ban/unban users',
      [PERMISSIONS.ADMIN_USERS_VIEW]: 'View admin users',
      [PERMISSIONS.ADMIN_USERS_CREATE]: 'Create admin users',
      [PERMISSIONS.ADMIN_USERS_UPDATE]: 'Update admin users',
      [PERMISSIONS.ADMIN_USERS_DELETE]: 'Delete admin users',
      [PERMISSIONS.ROLES_VIEW]: 'View roles',
      [PERMISSIONS.ROLES_CREATE]: 'Create roles',
      [PERMISSIONS.ROLES_UPDATE]: 'Update roles',
      [PERMISSIONS.ROLES_DELETE]: 'Delete roles',
      [PERMISSIONS.AUDIT_VIEW]: 'View audit logs',
    };

    return descriptions[code] || `Permission: ${code}`;
  }
}
