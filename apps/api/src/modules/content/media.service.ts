import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class MediaService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  // Artwork management
  async uploadArtwork(data: {
    ownerType: 'movie' | 'episode' | 'series' | 'season';
    ownerId: string;
    kind: 'poster' | 'backdrop' | 'sprite';
    file: {
      buffer: Buffer;
      mimetype: string;
      originalname: string;
    };
  }) {
    // Validate owner exists
    await this.validateOwner(data.ownerType, data.ownerId);

    // Generate storage path
    const path = this.storage.generatePath(
      data.kind === 'poster' ? 'poster' : 'backdrop',
      data.file.originalname
    );

    // Upload to storage
    const uploadResult = await this.storage.uploadFile(
      path,
      data.file.buffer,
      data.file.mimetype,
      {
        ownerType: data.ownerType,
        ownerId: data.ownerId,
        kind: data.kind,
      }
    );

    // Get image dimensions (you might want to use a library like sharp)
    // For now, we'll set default dimensions
    const width = 1920;
    const height = 1080;

    // Prepare artwork data with specific foreign keys
    const artworkData: any = {
      kind: data.kind,
      url: this.storage.getPublicUrl(path),
      width,
      height,
    };

    // Set the appropriate foreign key based on owner type
    switch (data.ownerType) {
      case 'movie':
        artworkData.movieId = data.ownerId;
        break;
      case 'episode':
        artworkData.episodeId = data.ownerId;
        break;
      case 'series':
        artworkData.seriesId = data.ownerId;
        break;
      case 'season':
        artworkData.seasonId = data.ownerId;
        break;
    }

    // Save artwork record
    const artwork = await this.prisma.artwork.create({
      data: artworkData,
    });

    return artwork;
  }

  async deleteArtwork(id: string) {
    const artwork = await this.prisma.artwork.findUnique({
      where: { id },
    });

    if (!artwork) {
      throw new NotFoundException('Artwork not found');
    }

    // Extract storage key from URL
    const urlParts = artwork.url.split('/');
    const storageKey = urlParts[urlParts.length - 1];

    // Delete from storage
    try {
      await this.storage.deleteFile(storageKey);
    } catch (error) {
      console.error('Failed to delete artwork from storage:', error);
    }

    // Delete from database
    await this.prisma.artwork.delete({ where: { id } });

    return { message: 'Artwork deleted successfully' };
  }

  async getArtworks(ownerType: string, ownerId: string) {
    const where: any = {};
    
    // Set the appropriate foreign key filter based on owner type
    switch (ownerType) {
      case 'movie':
        where.movieId = ownerId;
        break;
      case 'episode':
        where.episodeId = ownerId;
        break;
      case 'series':
        where.seriesId = ownerId;
        break;
      case 'season':
        where.seasonId = ownerId;
        break;
      default:
        throw new BadRequestException('Invalid owner type');
    }

    return this.prisma.artwork.findMany({
      where,
      orderBy: { kind: 'asc' },
    });
  }

  // Source management
  async addSource(data: {
    ownerType: 'movie' | 'episode';
    ownerId: string;
    type: 'hls' | 'dash' | 'mp4';
    url: string;
    quality?: string;
    drmFlag?: boolean;
    regionLimit?: string[];
  }) {
    // Validate owner exists
    await this.validateOwner(data.ownerType, data.ownerId);

    // Prepare source data with specific foreign keys
    const sourceData: any = {
      type: data.type,
      url: data.url,
      quality: data.quality,
      drmFlag: data.drmFlag || false,
      regionLimit: data.regionLimit || [],
      isActive: true,
    };

    // Set the appropriate foreign key based on owner type
    switch (data.ownerType) {
      case 'movie':
        sourceData.movieId = data.ownerId;
        break;
      case 'episode':
        sourceData.episodeId = data.ownerId;
        break;
    }

    const source = await this.prisma.source.create({
      data: sourceData,
    });

    return source;
  }

  async updateSource(id: string, data: {
    type?: string;
    url?: string;
    quality?: string;
    drmFlag?: boolean;
    regionLimit?: string[];
    isActive?: boolean;
  }) {
    const source = await this.prisma.source.findUnique({ where: { id } });
    if (!source) {
      throw new NotFoundException('Source not found');
    }

    return this.prisma.source.update({
      where: { id },
      data,
    });
  }

  async deleteSource(id: string) {
    const source = await this.prisma.source.findUnique({ where: { id } });
    if (!source) {
      throw new NotFoundException('Source not found');
    }

    await this.prisma.source.delete({ where: { id } });

    return { message: 'Source deleted successfully' };
  }

  async getSources(ownerType: string, ownerId: string) {
    const where: any = {};
    
    // Set the appropriate foreign key filter based on owner type
    switch (ownerType) {
      case 'movie':
        where.movieId = ownerId;
        break;
      case 'episode':
        where.episodeId = ownerId;
        break;
      default:
        throw new BadRequestException('Invalid owner type for sources');
    }

    return this.prisma.source.findMany({
      where,
      orderBy: { quality: 'desc' },
    });
  }

  // Subtitle management
  async uploadSubtitle(data: {
    ownerType: 'movie' | 'episode';
    ownerId: string;
    lang: string;
    format: 'srt' | 'vtt' | 'ass';
    isDefault?: boolean;
    file: {
      buffer: Buffer;
      mimetype: string;
      originalname: string;
    };
  }) {
    // Validate owner exists
    await this.validateOwner(data.ownerType, data.ownerId);

    // Generate storage path
    const path = this.storage.generatePath('subtitle', data.file.originalname);

    // Upload to storage
    await this.storage.uploadFile(
      path,
      data.file.buffer,
      data.file.mimetype,
      {
        ownerType: data.ownerType,
        ownerId: data.ownerId,
        lang: data.lang,
        format: data.format,
      }
    );

    // If this is default, unset other defaults
    if (data.isDefault) {
      const updateWhere: any = {};
      switch (data.ownerType) {
        case 'movie':
          updateWhere.movieId = data.ownerId;
          break;
        case 'episode':
          updateWhere.episodeId = data.ownerId;
          break;
      }
      
      await this.prisma.subtitle.updateMany({
        where: updateWhere,
        data: { isDefault: false },
      });
    }

    // Prepare subtitle data with specific foreign keys
    const subtitleData: any = {
      lang: data.lang,
      format: data.format,
      url: this.storage.getPublicUrl(path),
      isDefault: data.isDefault || false,
    };

    // Set the appropriate foreign key based on owner type
    switch (data.ownerType) {
      case 'movie':
        subtitleData.movieId = data.ownerId;
        break;
      case 'episode':
        subtitleData.episodeId = data.ownerId;
        break;
    }

    // Save subtitle record
    const subtitle = await this.prisma.subtitle.create({
      data: subtitleData,
    });

    return subtitle;
  }

  async deleteSubtitle(id: string) {
    const subtitle = await this.prisma.subtitle.findUnique({
      where: { id },
    });

    if (!subtitle) {
      throw new NotFoundException('Subtitle not found');
    }

    // Extract storage key from URL
    const urlParts = subtitle.url.split('/');
    const storageKey = urlParts[urlParts.length - 1];

    // Delete from storage
    try {
      await this.storage.deleteFile(storageKey);
    } catch (error) {
      console.error('Failed to delete subtitle from storage:', error);
    }

    // Delete from database
    await this.prisma.subtitle.delete({ where: { id } });

    return { message: 'Subtitle deleted successfully' };
  }

  async getSubtitles(ownerType: string, ownerId: string) {
    const where: any = {};
    
    // Set the appropriate foreign key filter based on owner type
    switch (ownerType) {
      case 'movie':
        where.movieId = ownerId;
        break;
      case 'episode':
        where.episodeId = ownerId;
        break;
      default:
        throw new BadRequestException('Invalid owner type for subtitles');
    }

    return this.prisma.subtitle.findMany({
      where,
      orderBy: [{ isDefault: 'desc' }, { lang: 'asc' }],
    });
  }

  // Storage utilities
  async generateUploadUrl(data: {
    type: 'poster' | 'backdrop' | 'avatar' | 'logo' | 'sponsor' | 'subtitle';
    filename: string;
    contentType: string;
  }) {
    const path = this.storage.generatePath(data.type, data.filename);
    
    const presignedUrl = await this.storage.generatePresignedUploadUrl(
      path,
      data.contentType,
      3600 // 1 hour
    );

    return {
      ...presignedUrl,
      path,
      publicUrl: this.storage.getPublicUrl(path),
    };
  }

  async getMediaStats() {
    const [
      totalArtworks,
      totalSources,
      totalSubtitles,
      artworksByKind,
      sourcesByType,
      subtitlesByLang,
      storageStats,
    ] = await Promise.all([
      this.prisma.artwork.count(),
      this.prisma.source.count({ where: { isActive: true } }),
      this.prisma.subtitle.count(),
      
      this.prisma.artwork.groupBy({
        by: ['kind'],
        _count: true,
      }),

      this.prisma.source.groupBy({
        by: ['type'],
        where: { isActive: true },
        _count: true,
      }),

      this.prisma.subtitle.groupBy({
        by: ['lang'],
        _count: true,
        orderBy: { _count: { lang: 'desc' } },
        take: 10,
      }),

      this.storage.getStorageStats(),
    ]);

    return {
      totalArtworks,
      totalSources,
      totalSubtitles,
      artworksByKind,
      sourcesByType,
      subtitlesByLang,
      storageStats,
    };
  }

  private async validateOwner(ownerType: string, ownerId: string) {
    let exists = false;

    switch (ownerType) {
      case 'movie':
        exists = !!(await this.prisma.movie.findUnique({ where: { id: ownerId } }));
        break;
      case 'episode':
        exists = !!(await this.prisma.episode.findUnique({ where: { id: ownerId } }));
        break;
      case 'series':
        exists = !!(await this.prisma.series.findUnique({ where: { id: ownerId } }));
        break;
      case 'season':
        exists = !!(await this.prisma.season.findUnique({ where: { id: ownerId } }));
        break;
      default:
        throw new BadRequestException('Invalid owner type');
    }

    if (!exists) {
      throw new NotFoundException(`${ownerType} not found`);
    }
  }
}
