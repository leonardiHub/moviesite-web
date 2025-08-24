import { Body, Controller, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { AuthGuard } from '@nestjs/passport';
import { RbacGuard, RequirePermissions } from '../auth/guards/rbac.guard';
import { PERMISSIONS } from '../../constants/permissions';

@ApiTags('Search')
@Controller('admin/search')
@UseGuards(AuthGuard('jwt'), RbacGuard)
@ApiBearerAuth()
export class SearchController {
  constructor(private readonly service: SearchService) {}

  @Post('reindex')
  @RequirePermissions(PERMISSIONS.SEARCH_MANAGE)
  @ApiOperation({ summary: 'Rebuild search indexes' })
  reindex() {
    return this.service.reindex();
  }

  @Put('synonyms')
  @RequirePermissions(PERMISSIONS.SEARCH_MANAGE)
  @ApiOperation({ summary: 'Update synonyms' })
  updateSynonyms(@Body() body: Record<string, string[]>) {
    return this.service.synonyms(body);
  }
}


