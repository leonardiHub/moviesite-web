import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BrandService {
  constructor(private readonly prisma: PrismaService) {}

  async getActive() {
    const brand = await this.prisma.brand.findFirst({ where: { isActive: true } });
    if (!brand) {
      const fallback = await this.prisma.brand.findFirst();
      return fallback || null;
    }
    return brand;
  }

  async upsertActive(payload: any) {
    const active = await this.prisma.brand.findFirst({ where: { isActive: true } });
    if (active) {
      return this.prisma.brand.update({
        where: { id: active.id },
        data: {
          name: payload.name,
          logosJson: payload.logo,
          paletteJson: payload.palette,
          fontFamily: payload.fontFamily,
          faviconUrl: payload.favicon,
          ogImageUrl: payload.ogImage,
          isActive: true,
        },
      });
    }
    return this.prisma.brand.create({
      data: {
        name: payload.name,
        logosJson: payload.logo,
        paletteJson: payload.palette,
        fontFamily: payload.fontFamily,
        faviconUrl: payload.favicon,
        ogImageUrl: payload.ogImage,
        isActive: true,
      },
    });
  }
}


