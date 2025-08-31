import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "../auth/auth.module";
import { ContentModule } from "../content/content.module";
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { RoleService } from "./role.service";
import { PermissionService } from "./permission.service";
import { AdminInitService } from "./admin-init.service";
import { AdminAuthService } from "./admin-auth.service";
import { AdminMoviesController } from "./admin-movies.controller";

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    AuthModule,
    ContentModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get("JWT_SECRET"),
        signOptions: {
          expiresIn: configService.get("JWT_EXPIRES_IN", "7d"),
        },
      }),
    }),
  ],
  controllers: [AdminController, AdminMoviesController],
  providers: [
    AdminService,
    RoleService,
    PermissionService,
    AdminInitService,
    AdminAuthService,
  ],
  exports: [
    AdminService,
    RoleService,
    PermissionService,
    AdminInitService,
    AdminAuthService,
  ],
})
export class AdminModule {}
