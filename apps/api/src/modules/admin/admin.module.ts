import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { RoleService } from './role.service';
import { PermissionService } from './permission.service';

@Module({
  controllers: [AdminController],
  providers: [AdminService, RoleService, PermissionService],
  exports: [AdminService, RoleService, PermissionService],
})
export class AdminModule {}
