import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SponsorService } from './sponsor.service';
import { AuthGuard } from '@nestjs/passport';
import { RbacGuard, RequirePermissions } from '../auth/guards/rbac.guard';
import { PERMISSIONS } from '../../constants/permissions';

@ApiTags('Sponsors')
@Controller('admin')
@UseGuards(AuthGuard('jwt'), RbacGuard)
@ApiBearerAuth()
export class SponsorController {
  constructor(private readonly service: SponsorService) {}

  @Get('sponsors')
  @RequirePermissions(PERMISSIONS.SPONSORS_VIEW)
  @ApiOperation({ summary: 'List sponsors' })
  sponsors() {
    return this.service.listSponsors();
  }

  @Post('sponsors')
  @RequirePermissions(PERMISSIONS.SPONSORS_CREATE)
  @ApiOperation({ summary: 'Create sponsor' })
  createSponsor(@Body() body: any) {
    return this.service.createSponsor(body);
  }

  @Get('placements')
  @RequirePermissions(PERMISSIONS.SPONSORS_VIEW)
  @ApiOperation({ summary: 'List placements' })
  placements() {
    return this.service.listPlacements();
  }

  @Post('placements')
  @RequirePermissions(PERMISSIONS.SPONSORS_CREATE)
  @ApiOperation({ summary: 'Create/Update placement' })
  upsertPlacement(@Body() body: any) {
    return this.service.upsertPlacement(body);
  }

  @Get('campaigns')
  @RequirePermissions(PERMISSIONS.CAMPAIGNS_VIEW)
  @ApiOperation({ summary: 'List campaigns' })
  campaigns() {
    return this.service.listCampaigns();
  }

  @Post('campaigns')
  @RequirePermissions(PERMISSIONS.CAMPAIGNS_CREATE)
  @ApiOperation({ summary: 'Create campaign' })
  createCampaign(@Body() body: any) {
    return this.service.createCampaign(body);
  }

  @Put('campaigns')
  @RequirePermissions(PERMISSIONS.CAMPAIGNS_UPDATE)
  @ApiOperation({ summary: 'Update campaign' })
  updateCampaign(@Body() body: any) {
    return this.service.updateCampaign(body.id, body);
  }

  @Post('campaigns/assets')
  @RequirePermissions(PERMISSIONS.CAMPAIGNS_UPDATE)
  @ApiOperation({ summary: 'Attach asset to campaign' })
  addAsset(@Body() body: any) {
    return this.service.addCampaignAsset(body.campaignId, body);
  }
}


