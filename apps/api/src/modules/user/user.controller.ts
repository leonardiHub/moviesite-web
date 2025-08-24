import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { RbacGuard, RequirePermissions } from '../auth/guards/rbac.guard';
import { PERMISSIONS } from '../../constants/permissions';

@ApiTags('Users')
@Controller('admin/users')
@UseGuards(AuthGuard('jwt'), RbacGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private readonly service: UserService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.USERS_VIEW)
  @ApiOperation({ summary: 'List users' })
  list(@Query('query') query?: string) {
    return this.service.list(query);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.USERS_VIEW)
  @ApiOperation({ summary: 'Get user detail with histories and favorites' })
  detail(@Param('id') id: string) {
    return this.service.detail(id);
  }

  @Post(':id/ban')
  @RequirePermissions(PERMISSIONS.USERS_BAN)
  @ApiOperation({ summary: 'Ban user' })
  ban(@Param('id') id: string) {
    return this.service.ban(id);
  }
}


