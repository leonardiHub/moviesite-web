import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService
  ) {}

  async findAll(filters: {
    search?: string;
    roleId?: string;
    page?: number;
    limit?: number;
  }) {
    const { search, roleId, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ];
    }

    if (roleId) {
      where.roles = {
        some: {
          roleId,
        },
      };
    }

    const [users, total] = await Promise.all([
      this.prisma.adminUser.findMany({
        where,
        include: {
          roles: {
            include: {
              role: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.adminUser.count({ where }),
    ]);

    const formattedUsers = users.map((user) => {
      const { passwordHash, twoFaSecret, ...userWithoutSensitiveData } = user;
      return {
        ...userWithoutSensitiveData,
        roles: user.roles.map((ur) => ur.role),
        hasTwoFactor: !!user.twoFaSecret,
      };
    });

    return {
      users: formattedUsers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.adminUser.findUnique({
      where: { id },
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
      throw new NotFoundException("Admin user not found");
    }

    const { passwordHash, twoFaSecret, ...userWithoutSensitiveData } = user;

    return {
      ...userWithoutSensitiveData,
      roles: user.roles.map((ur) => ur.role),
      permissions: user.roles.flatMap((ur) =>
        ur.role.permissions.map((rp) => rp.permission)
      ),
      hasTwoFactor: !!user.twoFaSecret,
    };
  }

  async create(data: {
    username: string;
    email: string;
    name: string;
    password: string;
    roleIds?: string[];
  }) {
    // Check if user already exists
    const existingUser = await this.prisma.adminUser.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException("User with this email already exists");
    }

    // Check if username is already taken
    const existingUsername = await this.prisma.adminUser.findUnique({
      where: { username: data.username },
    });

    if (existingUsername) {
      throw new ConflictException("Username is already taken");
    }

    // Hash password
    const saltRounds = parseInt(this.configService.get("BCRYPT_ROUNDS", "12"));
    const passwordHash = await bcrypt.hash(data.password, saltRounds);

    // Create user
    const user = await this.prisma.adminUser.create({
      data: {
        username: data.username,
        email: data.email,
        name: data.name,
        passwordHash,
      },
    });

    // Assign roles if provided
    if (data.roleIds && data.roleIds.length > 0) {
      const roleAssignments = data.roleIds.map((roleId) => ({
        adminUserId: user.id,
        roleId,
      }));

      await this.prisma.adminUserRole.createMany({
        data: roleAssignments,
      });
    }

    return this.findOne(user.id);
  }

  async update(
    id: string,
    data: {
      email?: string;
      name?: string;
      password?: string;
      roleIds?: string[];
    }
  ) {
    const user = await this.prisma.adminUser.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException("Admin user not found");
    }

    const updateData: any = {};

    if (data.email && data.email !== user.email) {
      // Check if email is already taken
      const existingUser = await this.prisma.adminUser.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new ConflictException("Email is already taken");
      }

      updateData.email = data.email;
    }

    if (data.name) {
      updateData.name = data.name;
    }

    if (data.password) {
      const saltRounds = parseInt(
        this.configService.get("BCRYPT_ROUNDS", "12")
      );
      updateData.passwordHash = await bcrypt.hash(data.password, saltRounds);
    }

    // Update user
    await this.prisma.adminUser.update({
      where: { id },
      data: updateData,
    });

    // Update roles if provided
    if (data.roleIds !== undefined) {
      // Remove existing roles
      await this.prisma.adminUserRole.deleteMany({
        where: { adminUserId: id },
      });

      // Add new roles
      if (data.roleIds.length > 0) {
        const roleAssignments = data.roleIds.map((roleId) => ({
          adminUserId: id,
          roleId,
        }));

        await this.prisma.adminUserRole.createMany({
          data: roleAssignments,
        });
      }
    }

    return this.findOne(id);
  }

  async delete(id: string) {
    const user = await this.prisma.adminUser.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException("Admin user not found");
    }

    await this.prisma.adminUser.delete({
      where: { id },
    });

    return { message: "Admin user deleted successfully" };
  }

  async getStats() {
    const [
      totalUsers,
      activeUsers,
      usersWithTwoFactor,
      recentLogins,
      roleDistribution,
    ] = await Promise.all([
      this.prisma.adminUser.count(),

      this.prisma.adminUser.count({
        where: {
          lastLoginAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),

      this.prisma.adminUser.count({
        where: {
          twoFaSecret: { not: null },
        },
      }),

      this.prisma.adminUser.count({
        where: {
          lastLoginAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),

      this.prisma.role.findMany({
        include: {
          users: true,
          _count: {
            select: {
              users: true,
            },
          },
        },
      }),
    ]);

    return {
      totalUsers,
      activeUsers,
      usersWithTwoFactor,
      recentLogins,
      twoFactorAdoptionRate:
        totalUsers > 0 ? (usersWithTwoFactor / totalUsers) * 100 : 0,
      roleDistribution: roleDistribution.map((role) => ({
        id: role.id,
        name: role.name,
        userCount: role._count.users,
      })),
    };
  }

  async initializeDefaultAdmin() {
    // Check if any admin user exists
    const adminCount = await this.prisma.adminUser.count();

    if (adminCount > 0) {
      return null; // Admin already exists
    }

    const defaultUsername = this.configService.get(
      "DEFAULT_ADMIN_USERNAME",
      "admin"
    );
    const defaultEmail = this.configService.get(
      "DEFAULT_ADMIN_EMAIL",
      "admin@moviesite.com"
    );
    const defaultPassword = this.configService.get(
      "DEFAULT_ADMIN_PASSWORD",
      "change-me-in-production"
    );

    // Hash password
    const saltRounds = parseInt(this.configService.get("BCRYPT_ROUNDS", "12"));
    const passwordHash = await bcrypt.hash(defaultPassword, saltRounds);

    // Create default admin
    const admin = await this.prisma.adminUser.create({
      data: {
        username: defaultUsername,
        email: defaultEmail,
        name: "System Administrator",
        passwordHash,
      },
    });

    // Get or create Super Admin role
    let superAdminRole = await this.prisma.role.findUnique({
      where: { name: "Super Admin" },
    });

    if (!superAdminRole) {
      superAdminRole = await this.prisma.role.create({
        data: {
          name: "Super Admin",
          description: "Full system access",
        },
      });
    }

    // Assign Super Admin role
    await this.prisma.adminUserRole.create({
      data: {
        adminUserId: admin.id,
        roleId: superAdminRole.id,
      },
    });

    return {
      email: defaultEmail,
      password: defaultPassword,
      message:
        "Default admin user created. Please change the password immediately.",
    };
  }
}
