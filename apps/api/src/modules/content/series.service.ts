import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MeilisearchService } from '../meilisearch/meilisearch.service';

@Injectable()
export class SeriesService {
  constructor(
    private prisma: PrismaService,
    private meilisearch: MeilisearchService,
  ) {}

  async findAll(filters: {
    search?: string;
    status?: string;
    genreId?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      search,
      status,
      genreId,
      page = 1,
      limit = 20,
    } = filters;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (status) where.status = status;
    if (genreId) {
      where.genres = { some: { genreId } };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { synopsis: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [series, total] = await Promise.all([
      this.prisma.series.findMany({
        where,
        include: {
          genres: { include: { genre: true } },
          tags: { include: { tag: true } },
          artworks: { where: { kind: 'poster' } },
          seasons: {
            include: {
              episodes: true,
            },
          },
          _count: {
            select: {
              seasons: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.series.count({ where }),
    ]);

    return {
      series: series.map(s => ({
        ...s,
        genres: s.genres.map(sg => sg.genre),
        tags: s.tags.map(st => st.tag),
        poster: s.artworks[0],
        seasonCount: s._count.seasons,
        episodeCount: s.seasons.reduce((acc, season) => acc + season.episodes.length, 0),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const series = await this.prisma.series.findUnique({
      where: { id },
      include: {
        genres: { include: { genre: true } },
        tags: { include: { tag: true } },
        credits: { include: { person: true } },
        artworks: true,
        seasons: {
          include: {
            episodes: {
              include: {
                sources: { where: { isActive: true } },
                subtitles: true,
                artworks: { where: { kind: 'poster' } },
              },
              orderBy: { seq: 'asc' },
            },
            artworks: { where: { kind: 'poster' } },
          },
          orderBy: { seq: 'asc' },
        },
      },
    });

    if (!series) {
      throw new NotFoundException('Series not found');
    }

    return {
      ...series,
      genres: series.genres.map(sg => sg.genre),
      tags: series.tags.map(st => st.tag),
    };
  }

  async create(data: {
    title: string;
    synopsis?: string;
    status?: string;
    genreIds?: string[];
    tagIds?: string[];
  }) {
    const series = await this.prisma.series.create({
      data: {
        title: data.title,
        synopsis: data.synopsis,
        status: data.status || 'draft',
      },
    });

    // Add genres
    if (data.genreIds?.length) {
      await this.prisma.seriesGenre.createMany({
        data: data.genreIds.map(genreId => ({
          seriesId: series.id,
          genreId,
        })),
      });
    }

    // Add tags
    if (data.tagIds?.length) {
      await this.prisma.seriesTag.createMany({
        data: data.tagIds.map(tagId => ({
          seriesId: series.id,
          tagId,
        })),
      });
    }

    // Index in search
    try {
      const seriesWithRelations = await this.findOne(series.id);
      await this.meilisearch.indexSeries(seriesWithRelations);
    } catch (error) {
      console.error('Failed to index series:', error);
    }

    return this.findOne(series.id);
  }

  async createSeason(seriesId: string, data: {
    seq: number;
    title?: string;
    synopsis?: string;
  }) {
    // Check if season with same seq already exists
    const existingSeason = await this.prisma.season.findUnique({
      where: {
        seriesId_seq: {
          seriesId,
          seq: data.seq,
        },
      },
    });

    if (existingSeason) {
      throw new BadRequestException(`Season ${data.seq} already exists`);
    }

    const season = await this.prisma.season.create({
      data: {
        seriesId,
        seq: data.seq,
        title: data.title,
        synopsis: data.synopsis,
      },
    });

    return season;
  }

  async createEpisode(seasonId: string, data: {
    seq: number;
    title: string;
    synopsis?: string;
    runtime?: number;
  }) {
    // Check if episode with same seq already exists
    const existingEpisode = await this.prisma.episode.findUnique({
      where: {
        seasonId_seq: {
          seasonId,
          seq: data.seq,
        },
      },
    });

    if (existingEpisode) {
      throw new BadRequestException(`Episode ${data.seq} already exists`);
    }

    const episode = await this.prisma.episode.create({
      data: {
        seasonId,
        seq: data.seq,
        title: data.title,
        synopsis: data.synopsis,
        runtime: data.runtime,
      },
    });

    return episode;
  }

  async update(id: string, data: {
    title?: string;
    synopsis?: string;
    status?: string;
    genreIds?: string[];
    tagIds?: string[];
  }) {
    const series = await this.prisma.series.findUnique({ where: { id } });
    if (!series) {
      throw new NotFoundException('Series not found');
    }

    // Update basic fields
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.synopsis !== undefined) updateData.synopsis = data.synopsis;
    if (data.status !== undefined) updateData.status = data.status;

    await this.prisma.series.update({
      where: { id },
      data: updateData,
    });

    // Update genres
    if (data.genreIds !== undefined) {
      await this.prisma.seriesGenre.deleteMany({ where: { seriesId: id } });
      if (data.genreIds.length > 0) {
        await this.prisma.seriesGenre.createMany({
          data: data.genreIds.map(genreId => ({
            seriesId: id,
            genreId,
          })),
        });
      }
    }

    // Update tags
    if (data.tagIds !== undefined) {
      await this.prisma.seriesTag.deleteMany({ where: { seriesId: id } });
      if (data.tagIds.length > 0) {
        await this.prisma.seriesTag.createMany({
          data: data.tagIds.map(tagId => ({
            seriesId: id,
            tagId,
          })),
        });
      }
    }

    // Update search index
    try {
      const updatedSeries = await this.findOne(id);
      await this.meilisearch.updateSeries(id, updatedSeries);
    } catch (error) {
      console.error('Failed to update series in search:', error);
    }

    return this.findOne(id);
  }

  async delete(id: string) {
    const series = await this.prisma.series.findUnique({ where: { id } });
    if (!series) {
      throw new NotFoundException('Series not found');
    }

    await this.prisma.series.delete({ where: { id } });

    // Remove from search index
    try {
      await this.meilisearch.deleteSeries(id);
    } catch (error) {
      console.error('Failed to delete series from search:', error);
    }

    return { message: 'Series deleted successfully' };
  }
}
