import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HomepageService {
  constructor(private prisma: PrismaService) {}

  async getSections() {
    return this.prisma.homepageSection.findMany({
      orderBy: { order: 'asc' },
    });
  }

  async getSection(id: string) {
    const section = await this.prisma.homepageSection.findUnique({
      where: { id },
    });

    if (!section) {
      throw new NotFoundException('Homepage section not found');
    }

    return section;
  }

  async createSection(data: {
    key: string;
    title: string;
    layout: 'hero' | 'carousel' | 'grid';
    config: any;
    order?: number;
  }) {
    // Check if key already exists
    const existingSection = await this.prisma.homepageSection.findUnique({
      where: { key: data.key },
    });

    if (existingSection) {
      throw new BadRequestException('Section with this key already exists');
    }

    // Set order if not provided
    let order = data.order;
    if (order === undefined) {
      const lastSection = await this.prisma.homepageSection.findFirst({
        orderBy: { order: 'desc' },
      });
      order = (lastSection?.order || 0) + 1;
    }

    // Validate config based on layout
    const validatedConfig = this.validateSectionConfig(data.layout, data.config);

    const section = await this.prisma.homepageSection.create({
      data: {
        key: data.key,
        title: data.title,
        layout: data.layout,
        configJson: validatedConfig,
        order,
      },
    });

    return section;
  }

  async updateSection(id: string, data: {
    title?: string;
    layout?: 'hero' | 'carousel' | 'grid';
    config?: any;
    order?: number;
  }) {
    const section = await this.prisma.homepageSection.findUnique({
      where: { id },
    });

    if (!section) {
      throw new NotFoundException('Homepage section not found');
    }

    const updateData: any = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.order !== undefined) updateData.order = data.order;

    if (data.layout !== undefined) {
      updateData.layout = data.layout;
      // If layout changes, validate config against new layout
      const configToValidate = data.config || section.configJson;
      updateData.configJson = this.validateSectionConfig(data.layout, configToValidate);
    } else if (data.config !== undefined) {
      // Validate config against current layout
      updateData.configJson = this.validateSectionConfig(section.layout, data.config);
    }

    const updatedSection = await this.prisma.homepageSection.update({
      where: { id },
      data: updateData,
    });

    return updatedSection;
  }

  async deleteSection(id: string) {
    const section = await this.prisma.homepageSection.findUnique({
      where: { id },
    });

    if (!section) {
      throw new NotFoundException('Homepage section not found');
    }

    await this.prisma.homepageSection.delete({ where: { id } });

    return { message: 'Homepage section deleted successfully' };
  }

  async reorderSections(sectionOrders: Array<{ id: string; order: number }>) {
    // Update all sections in a transaction
    await this.prisma.$transaction(
      sectionOrders.map(({ id, order }) =>
        this.prisma.homepageSection.update({
          where: { id },
          data: { order },
        })
      )
    );

    return { message: 'Sections reordered successfully' };
  }

  async previewHomepage() {
    const sections = await this.prisma.homepageSection.findMany({
      orderBy: { order: 'asc' },
    });

    // For each section, resolve the content based on config
    const resolvedSections = await Promise.all(
      sections.map(async (section) => {
        const resolvedConfig = await this.resolveContentForSection(section);
        return {
          ...section,
          resolvedContent: resolvedConfig,
        };
      })
    );

    return resolvedSections;
  }

  async duplicateSection(id: string, newKey: string) {
    const originalSection = await this.prisma.homepageSection.findUnique({
      where: { id },
    });

    if (!originalSection) {
      throw new NotFoundException('Homepage section not found');
    }

    // Check if new key already exists
    const existingSection = await this.prisma.homepageSection.findUnique({
      where: { key: newKey },
    });

    if (existingSection) {
      throw new BadRequestException('Section with this key already exists');
    }

    // Get next order
    const lastSection = await this.prisma.homepageSection.findFirst({
      orderBy: { order: 'desc' },
    });
    const order = (lastSection?.order || 0) + 1;

    const newSection = await this.prisma.homepageSection.create({
      data: {
        key: newKey,
        title: `${originalSection.title} (Copy)`,
        layout: originalSection.layout,
        configJson: originalSection.configJson as any,
        order,
      },
    });

    return newSection;
  }

  private validateSectionConfig(layout: string, config: any) {
    const baseSchema = {
      maxItems: config.maxItems || 10,
      autoPlay: config.autoPlay || false,
      showTitle: config.showTitle !== false,
      showDescription: config.showDescription !== false,
    };

    switch (layout) {
      case 'hero':
        return {
          ...baseSchema,
          maxItems: 1,
          showOverlay: config.showOverlay !== false,
          overlayText: config.overlayText || '',
          contentSource: this.validateContentSource(config.contentSource),
        };

      case 'carousel':
        return {
          ...baseSchema,
          maxItems: Math.min(config.maxItems || 10, 20),
          autoPlay: config.autoPlay || false,
          autoPlayInterval: config.autoPlayInterval || 5000,
          itemsPerView: config.itemsPerView || 5,
          contentSource: this.validateContentSource(config.contentSource),
        };

      case 'grid':
        return {
          ...baseSchema,
          maxItems: Math.min(config.maxItems || 12, 50),
          columns: config.columns || 4,
          aspectRatio: config.aspectRatio || '16:9',
          contentSource: this.validateContentSource(config.contentSource),
        };

      default:
        throw new BadRequestException('Invalid layout type');
    }
  }

  private validateContentSource(contentSource: any) {
    if (!contentSource || !contentSource.type) {
      throw new BadRequestException('Content source is required');
    }

    const validTypes = ['latest', 'trending', 'featured', 'collection', 'genre', 'custom'];
    if (!validTypes.includes(contentSource.type)) {
      throw new BadRequestException('Invalid content source type');
    }

    return {
      type: contentSource.type,
      filters: contentSource.filters || {},
      collectionId: contentSource.collectionId,
      genreId: contentSource.genreId,
      customIds: contentSource.customIds || [],
    };
  }

  private async resolveContentForSection(section: any) {
    const config = section.configJson;
    const contentSource = config.contentSource;

    let content: any[] = [];

    switch (contentSource.type) {
      case 'latest':
        content = await this.getLatestContent(contentSource.filters, config.maxItems);
        break;

      case 'trending':
        content = await this.getTrendingContent(contentSource.filters, config.maxItems);
        break;

      case 'featured':
        content = await this.getFeaturedContent(contentSource.filters, config.maxItems);
        break;

      case 'collection':
        if (contentSource.collectionId) {
          content = await this.getCollectionContent(contentSource.collectionId, config.maxItems);
        }
        break;

      case 'genre':
        if (contentSource.genreId) {
          content = await this.getGenreContent(contentSource.genreId, config.maxItems);
        }
        break;

      case 'custom':
        if (contentSource.customIds?.length) {
          content = await this.getCustomContent(contentSource.customIds);
        }
        break;
    }

    return content;
  }

  private async getLatestContent(filters: any, limit: number) {
    const whereClause: any = { status: 'published' };
    if (filters.contentType === 'movies') {
      whereClause.type = 'movie';
    } else if (filters.contentType === 'series') {
      whereClause.type = 'series';
    }

    const movies = await this.prisma.movie.findMany({
      where: whereClause.type !== 'series' ? whereClause : undefined,
      include: {
        artworks: { where: { kind: 'poster' }, take: 1 },
        genres: { include: { genre: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return movies.map(movie => ({
      id: movie.id,
      title: movie.title,
      type: 'movie',
      poster: movie.artworks[0]?.url,
      genres: movie.genres.map(g => g.genre.name),
    }));
  }

  private async getTrendingContent(filters: any, limit: number) {
    // This would integrate with analytics to get trending content
    // For now, return latest content as placeholder
    return this.getLatestContent(filters, limit);
  }

  private async getFeaturedContent(filters: any, limit: number) {
    // This would get featured/promoted content
    // For now, return latest content as placeholder
    return this.getLatestContent(filters, limit);
  }

  private async getCollectionContent(collectionId: string, limit: number) {
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
      include: {
        items: {
          include: {
            movie: {
              include: {
                artworks: { where: { kind: 'poster' }, take: 1 },
                genres: { include: { genre: true } },
              },
            },
            series: {
              include: {
                artworks: { where: { kind: 'poster' }, take: 1 },
                genres: { include: { genre: true } },
              },
            },
          },
          orderBy: { order: 'asc' },
          take: limit,
        },
      },
    });

    if (!collection) return [];

    return collection.items.map(item => {
      const content = item.movie || item.series;
      if (!content) return null;
      
      return {
        id: content.id,
        title: content.title,
        type: item.movieId ? 'movie' : 'series',
        poster: content.artworks?.[0]?.url,
        genres: content.genres?.map((g: any) => g.genre.name) || [],
      };
    }).filter(Boolean);
  }

  private async getGenreContent(genreId: string, limit: number) {
    const movies = await this.prisma.movie.findMany({
      where: {
        status: 'published',
        genres: { some: { genreId } },
      },
      include: {
        artworks: { where: { kind: 'poster' }, take: 1 },
        genres: { include: { genre: true } },
      },
      orderBy: { year: 'desc' },
      take: limit,
    });

    return movies.map(movie => ({
      id: movie.id,
      title: movie.title,
      type: 'movie',
      poster: movie.artworks[0]?.url,
      genres: movie.genres.map(g => g.genre.name),
    }));
  }

  private async getCustomContent(contentIds: string[]) {
    const movies = await this.prisma.movie.findMany({
      where: { id: { in: contentIds } },
      include: {
        artworks: { where: { kind: 'poster' }, take: 1 },
        genres: { include: { genre: true } },
      },
    });

    return movies.map(movie => ({
      id: movie.id,
      title: movie.title,
      type: 'movie',
      poster: movie.artworks[0]?.url,
      genres: movie.genres.map(g => g.genre.name),
    }));
  }
}
