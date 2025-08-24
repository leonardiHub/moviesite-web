import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const { sub: userId, email, permissions } = payload;

    // Verify user still exists and is active
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

    // Get current permissions (in case they changed)
    const currentPermissions = user.roles.flatMap(userRole =>
      userRole.role.permissions.map(rolePermission => rolePermission.permission.code)
    );

    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      permissions: currentPermissions,
      roles: user.roles.map(ur => ur.role),
    };
  }
}
