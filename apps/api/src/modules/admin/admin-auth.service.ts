import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import * as bcrypt from "bcrypt";

@Injectable()
export class AdminAuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async validateAdmin(username: string, password: string) {
    const admin = await this.prisma.adminUser.findUnique({
      where: { username },
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

    if (!admin) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // Update last login
    await this.prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    return admin;
  }

  async login(username: string, password: string) {
    const admin = await this.validateAdmin(username, password);

    // Extract permissions from roles
    const permissions = new Set<string>();
    admin.roles.forEach((userRole) => {
      userRole.role.permissions.forEach((rolePermission) => {
        permissions.add(rolePermission.permission.code);
      });
    });

    const payload = {
      userId: admin.id,
      username: admin.username,
      email: admin.email,
      name: admin.name,
      permissions: Array.from(permissions),
      type: "admin",
    };

    // Generate access token (short-lived)
    const accessToken = this.jwtService.sign(payload, { expiresIn: "1h" });

    // Generate refresh token (long-lived)
    const refreshToken = this.jwtService.sign(payload, { expiresIn: "7d" });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        name: admin.name,
        permissions: Array.from(permissions),
        roles: admin.roles.map((ur) => ur.role.name),
      },
    };
  }

  async getProfile(adminId: string) {
    const admin = await this.prisma.adminUser.findUnique({
      where: { id: adminId },
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

    if (!admin) {
      throw new UnauthorizedException("Admin user not found");
    }

    const permissions = new Set<string>();
    admin.roles.forEach((userRole) => {
      userRole.role.permissions.forEach((rolePermission) => {
        permissions.add(rolePermission.permission.code);
      });
    });

    return {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      name: admin.name,
      permissions: Array.from(permissions),
      roles: admin.roles.map((ur) => ur.role.name),
      lastLoginAt: admin.lastLoginAt,
      createdAt: admin.createdAt,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      // Verify the refresh token
      const payload = this.jwtService.verify(refreshToken);

      // Get the admin user
      const admin = await this.prisma.adminUser.findUnique({
        where: { id: payload.userId },
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

      if (!admin) {
        throw new UnauthorizedException("Admin user not found");
      }

      // Extract permissions from roles
      const permissions = new Set<string>();
      admin.roles.forEach((userRole) => {
        userRole.role.permissions.forEach((rolePermission) => {
          permissions.add(rolePermission.permission.code);
        });
      });

      // Generate new access token
      const newPayload = {
        userId: admin.id,
        username: admin.username,
        email: admin.email,
        name: admin.name,
        permissions: Array.from(permissions),
        type: "admin",
      };

      return {
        access_token: this.jwtService.sign(newPayload),
        user: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          name: admin.name,
          permissions: Array.from(permissions),
          roles: admin.roles.map((ur) => ur.role.name),
        },
      };
    } catch (error) {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }
}
