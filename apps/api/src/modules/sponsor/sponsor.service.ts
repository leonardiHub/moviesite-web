import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SponsorService {
  constructor(private readonly prisma: PrismaService) {}

  // Sponsors
  listSponsors() {
    return this.prisma.sponsor.findMany({ orderBy: { name: 'asc' } });
  }

  createSponsor(data: { name: string; website?: string; contact?: string }) {
    return this.prisma.sponsor.create({ data });
  }

  // Placements
  listPlacements() {
    return this.prisma.placement.findMany({ orderBy: { key: 'asc' } });
  }

  upsertPlacement(payload: { key: string; ratio?: string; maxAssets?: number; description?: string }) {
    return this.prisma.placement.upsert({
      where: { key: payload.key },
      update: { ratio: payload.ratio, maxAssets: payload.maxAssets, description: payload.description },
      create: { key: payload.key, ratio: payload.ratio, maxAssets: payload.maxAssets ?? 1, description: payload.description },
    });
  }

  // Campaigns
  listCampaigns() {
    return this.prisma.campaign.findMany({ include: { sponsor: true, placement: true, assets: true } });
  }

  createCampaign(payload: any) {
    return this.prisma.campaign.create({
      data: {
        sponsorId: payload.sponsorId,
        name: payload.name,
        placementId: payload.placementId,
        startAt: payload.startAt ? new Date(payload.startAt) : null,
        endAt: payload.endAt ? new Date(payload.endAt) : null,
        targetingJson: payload.targeting ?? {},
        freqCapJson: payload.frequencyCap ?? {},
        status: payload.status ?? 'draft',
      },
    });
  }

  updateCampaign(id: string, payload: any) {
    return this.prisma.campaign.update({
      where: { id },
      data: {
        name: payload.name,
        startAt: payload.startAt ? new Date(payload.startAt) : undefined,
        endAt: payload.endAt ? new Date(payload.endAt) : undefined,
        targetingJson: payload.targeting,
        freqCapJson: payload.frequencyCap,
        status: payload.status,
      },
    });
  }

  addCampaignAsset(campaignId: string, asset: { assetId: string; weight: number; clickUrl: string; utm?: any }) {
    return this.prisma.campaignAsset.create({
      data: {
        campaignId,
        assetId: asset.assetId,
        weight: asset.weight ?? 100,
        clickUrl: asset.clickUrl,
        utmJson: asset.utm ?? {},
      },
    });
  }
}


