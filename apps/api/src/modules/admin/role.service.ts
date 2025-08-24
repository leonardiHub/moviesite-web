import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: {
            users: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        users: {
          include: {
            adminUser: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return {
      ...role,
      permissions: role.permissions.map(rp => rp.permission),
      users: role.users.map(ur => ur.adminUser),
    };
  }

  async create(data: {
    name: string;
    description?: string;
    permissionIds?: string[];
  }) {
    // Check if role already exists
    const existingRole = await this.prisma.role.findUnique({
      where: { name: data.name },
    });

    if (existingRole) {
      throw new ConflictException('Role with this name already exists');
    }

    const role = await this.prisma.role.create({
      data: {
        name: data.name,
        description: data.description,
      },
    });

    // Assign permissions if provided
    if (data.permissionIds && data.permissionIds.length > 0) {
      const permissionAssignments = data.permissionIds.map(permissionId => ({
        roleId: role.id,
        permissionId,
      }));

      await this.prisma.rolePermission.createMany({
        data: permissionAssignments,
      });
    }

    return this.findOne(role.id);
  }

  async update(id: string, data: {
    name?: string;
    description?: string;
    permissionIds?: string[];
  }) {
    const role = await this.prisma.role.findUnique({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const updateData: any = {};

    if (data.name && data.name !== role.name) {
      // Check if name is already taken
      const existingRole = await this.prisma.role.findUnique({
        where: { name: data.name },
      });

      if (existingRole) {
        throw new ConflictException('Role name is already taken');
      }

      updateData.name = data.name;
    }

    if (data.description !== undefined) {
      updateData.description = data.description;
    }

    // Update role
    await this.prisma.role.update({
      where: { id },
      data: updateData,
    });

    // Update permissions if provided
    if (data.permissionIds !== undefined) {
      // Remove existing permissions
      await this.prisma.rolePermission.deleteMany({
        where: { roleId: id },
      });

      // Add new permissions
      if (data.permissionIds.length > 0) {
        const permissionAssignments = data.permissionIds.map(permissionId => ({
          roleId: id,
          permissionId,
        }));

        await this.prisma.rolePermission.createMany({
          data: permissionAssignments,
        });
      }
    }

    return this.findOne(id);
  }

  async delete(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role._count.users > 0) {
      throw new ConflictException('Cannot delete role that is assigned to users');
    }

    await this.prisma.role.delete({
      where: { id },
    });

    return { message: 'Role deleted successfully' };
  }

  async getPermissionMatrix() {
    const roles = await this.prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    const allPermissions = await this.prisma.permission.findMany({
      orderBy: { code: 'asc' },
    });

    const matrix = roles.map(role => ({
      id: role.id,
      name: role.name,
      permissions: allPermissions.map(permission => ({
        code: permission.code,
        description: permission.description,
        granted: role.permissions.some(rp => rp.permission.code === permission.code),
      })),
    }));

    return {
      roles: matrix,
      allPermissions,
    };
  }
}
