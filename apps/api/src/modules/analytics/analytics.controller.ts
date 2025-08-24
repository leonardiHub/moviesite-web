import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { AuthGuard } from '@nestjs/passport';
import { RbacGuard, RequirePermissions } from '../auth/guards/rbac.guard';
import { PERMISSIONS } from '../../constants/permissions';

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(AuthGuard('jwt'), RbacGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  @Get('overview')
  @RequirePermissions(PERMISSIONS.ANALYTICS_VIEW)
  @ApiOperation({ summary: 'Overview metrics' })
  async overview(@Query('start') start: string, @Query('end') end: string) {
    const range = this.normalizeRange(start, end);
    return this.service.overview(range);
  }

  @Get('content')
  @RequirePermissions(PERMISSIONS.ANALYTICS_VIEW)
  @ApiOperation({ summary: 'Content analytics by movieId' })
  async content(
    @Query('movieId') movieId: string,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    const range = this.normalizeRange(start, end);
    return this.service.content(movieId, range);
  }

  @Get('funnel')
  @RequirePermissions(PERMISSIONS.ANALYTICS_VIEW)
  @ApiOperation({ summary: 'Funnel analytics (landing -> play -> complete)' })
  async funnel(@Query('start') start: string, @Query('end') end: string) {
    const range = this.normalizeRange(start, end);
    return this.service.funnel(range);
  }

  private normalizeRange(start?: string, end?: string) {
    const endDate = end ? new Date(end) : new Date();
    const startDate = start ? new Date(start) : new Date(Date.now() - 7 * 24 * 3600 * 1000);
    return { start: startDate.toISOString(), end: endDate.toISOString() };
  }
}


