import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MeilisearchService } from '../meilisearch/meilisearch.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class MovieService {
  constructor(
    private prisma: PrismaService,
    private meilisearch: MeilisearchService,
    private storage: StorageService,
  ) {}

  async findAll(filters: {
    search?: string;
    status?: string;
    genreId?: string;
    tagId?: string;
    year?: number;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const {
      search,
      status,
      genreId,
      tagId,
      year,
      page = 1,
      limit = 20,
      sortBy = 'updatedAt',
      sortOrder = 'desc',
    } = filters;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (year) {
      where.year = year;
    }

    if (genreId) {
      where.genres = {
        some: { genreId },
      };
    }

    if (tagId) {
      where.tags = {
        some: { tagId },
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { originalTitle: { contains: search, mode: 'insensitive' } },
        { synopsis: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [movies, total] = await Promise.all([
      this.prisma.movie.findMany({
        where,
        include: {
          genres: {
            include: { genre: true },
          },
          tags: {
            include: { tag: true },
          },
          credits: {
            include: { person: true },
            take: 10, // Limit credits to avoid huge responses
          },
          artworks: {
            where: { kind: { in: ['poster', 'backdrop'] } },
          },
          sources: {
            where: { isActive: true },
            take: 5,
          },
          _count: {
            select: {
              sources: { where: { isActive: true } },
              subtitles: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.movie.count({ where }),
    ]);

    return {
      movies: movies.map(movie => ({
        ...movie,
        genres: movie.genres.map(mg => mg.genre),
        tags: movie.tags.map(mt => mt.tag),
        poster: movie.artworks.find(a => a.kind === 'poster'),
        backdrop: movie.artworks.find(a => a.kind === 'backdrop'),
        sourcesCount: movie._count.sources,
        subtitlesCount: movie._count.subtitles,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const movie = await this.prisma.movie.findUnique({
      where: { id },
      include: {
        genres: {
          include: { genre: true },
        },
        tags: {
          include: { tag: true },
        },
        credits: {
          include: { person: true },
          orderBy: { role: 'asc' },
        },
        artworks: true,
        sources: {
          orderBy: { quality: 'desc' },
        },
        subtitles: {
          orderBy: { lang: 'asc' },
        },
        collectionItems: {
          include: {
            collection: true,
          },
        },
      },
    });

    if (!movie) {
      throw new NotFoundException('Movie not found');
    }

    return {
      ...movie,
      genres: movie.genres.map(mg => mg.genre),
      tags: movie.tags.map(mt => mt.tag),
      collections: movie.collectionItems.map(ci => ci.collection),
    };
  }

  async create(data: {
    title: string;
    originalTitle?: string;
    synopsis?: string;
    year?: number;
    runtime?: number;
    ageRating?: string;
    languages?: string[];
    countries?: string[];
    status?: string;
    genreIds?: string[];
    tagIds?: string[];
    credits?: Array<{ personId: string; role: string }>;
  }) {
    // Validate required fields
    if (!data.title) {
      throw new BadRequestException('Title is required');
    }

    const movie = await this.prisma.movie.create({
      data: {
        title: data.title,
        originalTitle: data.originalTitle,
        synopsis: data.synopsis,
        year: data.year,
        runtime: data.runtime,
        ageRating: data.ageRating,
        languages: data.languages || [],
        countries: data.countries || [],
        status: data.status || 'draft',
      },
    });

    // Add genres
    if (data.genreIds && data.genreIds.length > 0) {
      await this.prisma.movieGenre.createMany({
        data: data.genreIds.map(genreId => ({
          movieId: movie.id,
          genreId,
        })),
      });
    }

    // Add tags
    if (data.tagIds && data.tagIds.length > 0) {
      await this.prisma.movieTag.createMany({
        data: data.tagIds.map(tagId => ({
          movieId: movie.id,
          tagId,
        })),
      });
    }

    // Add credits
    if (data.credits && data.credits.length > 0) {
      await this.prisma.credit.createMany({
        data: data.credits.map(credit => ({
          movieId: movie.id,
          personId: credit.personId,
          role: credit.role,
        })),
      });
    }

    // Index in search engine
    try {
      const movieWithRelations = await this.findOne(movie.id);
      await this.meilisearch.indexMovie(movieWithRelations);
    } catch (error) {
      console.error('Failed to index movie in search engine:', error);
    }

    return this.findOne(movie.id);
  }

  async update(id: string, data: {
    title?: string;
    originalTitle?: string;
    synopsis?: string;
    year?: number;
    runtime?: number;
    ageRating?: string;
    languages?: string[];
    countries?: string[];
    status?: string;
    genreIds?: string[];
    tagIds?: string[];
    credits?: Array<{ personId: string; role: string }>;
  }) {
    const movie = await this.prisma.movie.findUnique({ where: { id } });
    if (!movie) {
      throw new NotFoundException('Movie not found');
    }

    // Update basic fields
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.originalTitle !== undefined) updateData.originalTitle = data.originalTitle;
    if (data.synopsis !== undefined) updateData.synopsis = data.synopsis;
    if (data.year !== undefined) updateData.year = data.year;
    if (data.runtime !== undefined) updateData.runtime = data.runtime;
    if (data.ageRating !== undefined) updateData.ageRating = data.ageRating;
    if (data.languages !== undefined) updateData.languages = data.languages;
    if (data.countries !== undefined) updateData.countries = data.countries;
    if (data.status !== undefined) updateData.status = data.status;

    await this.prisma.movie.update({
      where: { id },
      data: updateData,
    });

    // Update genres
    if (data.genreIds !== undefined) {
      await this.prisma.movieGenre.deleteMany({ where: { movieId: id } });
      if (data.genreIds.length > 0) {
        await this.prisma.movieGenre.createMany({
          data: data.genreIds.map(genreId => ({
            movieId: id,
            genreId,
          })),
        });
      }
    }

    // Update tags
    if (data.tagIds !== undefined) {
      await this.prisma.movieTag.deleteMany({ where: { movieId: id } });
      if (data.tagIds.length > 0) {
        await this.prisma.movieTag.createMany({
          data: data.tagIds.map(tagId => ({
            movieId: id,
            tagId,
          })),
        });
      }
    }

    // Update credits
    if (data.credits !== undefined) {
      await this.prisma.credit.deleteMany({ where: { movieId: id } });
      if (data.credits.length > 0) {
        await this.prisma.credit.createMany({
          data: data.credits.map(credit => ({
            movieId: id,
            personId: credit.personId,
            role: credit.role,
          })),
        });
      }
    }

    // Update search index
    try {
      const updatedMovie = await this.findOne(id);
      await this.meilisearch.updateMovie(id, updatedMovie);
    } catch (error) {
      console.error('Failed to update movie in search engine:', error);
    }

    return this.findOne(id);
  }

  async delete(id: string) {
    const movie = await this.prisma.movie.findUnique({
      where: { id },
      include: {
        artworks: true,
        sources: true,
        subtitles: true,
      },
    });

    if (!movie) {
      throw new NotFoundException('Movie not found');
    }

    // Delete related files from storage
    const filesToDelete = [
      ...movie.artworks.map(a => a.url),
      ...movie.subtitles.map(s => s.url),
    ];

    try {
      const storageKeys = filesToDelete
        .map(url => url.split('/').pop())
        .filter(Boolean) as string[];
      
      if (storageKeys.length > 0) {
        await this.storage.deleteFiles(storageKeys);
      }
    } catch (error) {
      console.error('Failed to delete movie files from storage:', error);
    }

    // Delete from database (cascade will handle relations)
    await this.prisma.movie.delete({ where: { id } });

    // Remove from search index
    try {
      await this.meilisearch.deleteMovie(id);
    } catch (error) {
      console.error('Failed to delete movie from search engine:', error);
    }

    return { message: 'Movie deleted successfully' };
  }

  async bulkImport(movies: Array<any>) {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as Array<{ movie: any; error: string }>,
    };

    for (const movieData of movies) {
      try {
        await this.create(movieData);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          movie: movieData,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return results;
  }

  async getStats() {
    const [
      totalMovies,
      publishedMovies,
      draftMovies,
      moviesWithoutPoster,
      moviesWithoutSources,
      recentlyAdded,
      languageDistribution,
      yearDistribution,
    ] = await Promise.all([
      this.prisma.movie.count(),
      this.prisma.movie.count({ where: { status: 'published' } }),
      this.prisma.movie.count({ where: { status: 'draft' } }),
      this.prisma.movie.count({
        where: {
          artworks: {
            none: { kind: 'poster' },
          },
        },
      }),
      this.prisma.movie.count({
        where: {
          sources: {
            none: { isActive: true },
          },
        },
      }),
      this.prisma.movie.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      this.prisma.$queryRaw`
        SELECT 
          unnest(languages) as language,
          COUNT(*) as count
        FROM movies 
        WHERE array_length(languages, 1) > 0
        GROUP BY language 
        ORDER BY count DESC 
        LIMIT 10
      `,
      this.prisma.$queryRaw`
        SELECT 
          year,
          COUNT(*) as count
        FROM movies 
        WHERE year IS NOT NULL
        GROUP BY year 
        ORDER BY year DESC 
        LIMIT 20
      `,
    ]);

    return {
      totalMovies,
      publishedMovies,
      draftMovies,
      moviesWithoutPoster,
      moviesWithoutSources,
      recentlyAdded,
      languageDistribution,
      yearDistribution,
      completionRate: totalMovies > 0 ? (publishedMovies / totalMovies) * 100 : 0,
    };
  }
}
