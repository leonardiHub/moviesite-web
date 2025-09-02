import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { MeilisearchService } from "../meilisearch/meilisearch.service";
import { StorageService } from "../storage/storage.service";
import { CreateMovieDto, UpdateMovieDto, MovieStatus } from "./dto/movie.dto";
import { CreateArtworkDto, ArtworkKind } from "./dto/artwork.dto";

@Injectable()
export class MovieService {
  constructor(
    private prisma: PrismaService,
    private meilisearch: MeilisearchService,
    private storage: StorageService,
    private configService: ConfigService
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
    sortOrder?: "asc" | "desc";
  }) {
    const {
      search,
      status,
      genreId,
      tagId,
      year,
      page = 1,
      limit = 20,
      sortBy = "updatedAt",
      sortOrder = "desc",
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
        { title: { contains: search, mode: "insensitive" } },
        { originalTitle: { contains: search, mode: "insensitive" } },
        { synopsis: { contains: search, mode: "insensitive" } },
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
          countries: {
            include: { country: true },
          },
          artworks: {
            where: { kind: { in: ["poster", "backdrop"] } },
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

    // Add poster and video information to each movie
    const enhancedMovies = movies.map((movie) => {
      const poster = movie.artworks.find((a) => a.kind === "poster");
      const videoSource = movie.sources[0]; // First active source

      // Convert S3 key to image endpoint URL if poster exists
      let posterUrl = poster?.url;
      if (posterUrl && !posterUrl.startsWith("http")) {
        const baseUrl = this.configService.get(
          "PUBLIC_BASE_URL",
          "http://51.79.254.237:4000"
        );
        // If the S3 key contains a path (e.g., "posters/filename.png"),
        // use the general image endpoint to avoid path encoding issues
        if (posterUrl.includes("/")) {
          posterUrl = `${baseUrl}/v1/images/${encodeURIComponent(posterUrl)}`;
        } else {
          posterUrl = `${baseUrl}/v1/images/poster/${encodeURIComponent(posterUrl)}`;
        }
      }

      // Convert S3 key to video endpoint URL if video exists
      let videoUrl = videoSource?.url;
      if (videoUrl && !videoUrl.startsWith("http")) {
        const baseUrl = this.configService.get(
          "PUBLIC_BASE_URL",
          "http://51.79.254.237:4000"
        );
        // If the S3 key contains a path (e.g., "videos/filename.mp4"),
        // use the general video endpoint
        if (videoUrl.includes("/")) {
          videoUrl = `${baseUrl}/v1/videos/${encodeURIComponent(videoUrl)}`;
        } else {
          videoUrl = `${baseUrl}/v1/videos/${encodeURIComponent(videoUrl)}`;
        }
      }

      return {
        ...movie,
        posterUrl,
        posterId: poster?.id,
        videoUrl: videoUrl || null,
        videoId: videoSource?.id || null,
        videoQuality: videoSource?.quality || null,
        videoType: videoSource?.type || null,
      };
    });

    return {
      items: enhancedMovies,
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
          orderBy: { role: "asc" },
        },
        countries: {
          include: { country: true },
        },
        artworks: true,
        sources: {
          orderBy: { quality: "desc" },
        },
        subtitles: {
          orderBy: { lang: "asc" },
        },
        collectionItems: {
          include: {
            collection: true,
          },
        },
      },
    });

    if (!movie) {
      throw new NotFoundException("Movie not found");
    }

    // Add poster and video information
    const poster = movie.artworks.find((a) => a.kind === "poster");
    const videoSource = movie.sources[0]; // First active source

    // Convert S3 key to image endpoint URL if poster exists
    let posterUrl = poster?.url;
    if (posterUrl && !posterUrl.startsWith("http")) {
      const baseUrl = this.configService.get(
        "PUBLIC_BASE_URL",
        "http://51.79.254.237:4000"
      );
      // If the S3 key contains a path (e.g., "posters/filename.png"),
      // use the general image endpoint to avoid path encoding issues
      if (posterUrl.includes("/")) {
        posterUrl = `${baseUrl}/v1/images/${encodeURIComponent(posterUrl)}`;
      } else {
        posterUrl = `${baseUrl}/v1/images/poster/${encodeURIComponent(posterUrl)}`;
      }
    }

    // Convert S3 key to video endpoint URL if video exists
    let videoUrl = videoSource?.url;
    if (videoUrl && !videoUrl.startsWith("http")) {
      const baseUrl = this.configService.get(
        "PUBLIC_BASE_URL",
        "http://51.79.254.237:4000"
      );
      // If the S3 key contains a path (e.g., "videos/filename.mp4"),
      // use the general video endpoint
      if (videoUrl.includes("/")) {
        videoUrl = `${baseUrl}/v1/videos/${encodeURIComponent(videoUrl)}`;
      } else {
        videoUrl = `${baseUrl}/v1/videos/${encodeURIComponent(videoUrl)}`;
      }
    }

    const enhancedMovie = {
      ...movie,
      posterUrl,
      posterId: poster?.id,
      videoUrl,
      videoId: videoSource?.id,
      videoQuality: videoSource?.quality,
      videoType: videoSource?.type,
    };

    return enhancedMovie;
  }

  // Create movie with enhanced data and poster handling
  async create(createMovieDto: CreateMovieDto) {
    const {
      genreIds,
      tagIds,
      credits,
      countries,

      posterFile,
      posterUrl,
      videoFile,
      videoUrl,
      ...movieData
    } = createMovieDto;

    // Remove posterUrl from movieData since it's not a database field
    // posterUrl is only used for poster file handling, not for movie data updates
    delete (movieData as any).posterUrl;

    // Filter out invalid credits (personId must exist in database)
    let validCredits = undefined;
    if (credits && credits.length > 0) {
      const personIds = credits.map((c) => c.personId).filter(Boolean);
      if (personIds.length > 0) {
        const existingPeople = await this.prisma.person.findMany({
          where: { id: { in: personIds } },
          select: { id: true },
        });
        const validPersonIds = new Set(existingPeople.map((p) => p.id));
        validCredits = credits.filter(
          (credit) =>
            credit.personId &&
            credit.role &&
            validPersonIds.has(credit.personId)
        );
      }
    }

    const movie = await this.prisma.movie.create({
      data: {
        ...movieData,
        genres: genreIds
          ? {
              create: genreIds.map((genreId) => ({
                genre: { connect: { id: genreId } },
              })),
            }
          : undefined,
        tags: tagIds
          ? {
              create: tagIds.map((tagId) => ({
                tag: { connect: { id: tagId } },
              })),
            }
          : undefined,
        credits:
          validCredits && validCredits.length > 0
            ? {
                create: validCredits.map((credit) => ({
                  person: { connect: { id: credit.personId } },
                  role: credit.role,
                })),
              }
            : undefined,
        countries:
          countries && countries.length > 0
            ? {
                create: countries.map((countryId: string) => ({
                  country: { connect: { id: countryId } },
                })),
              }
            : undefined,
      },
      include: {
        genres: { include: { genre: true } },
        tags: { include: { tag: true } },
        credits: { include: { person: true } },
        countries: { include: { country: true } },
        artworks: true,
        _count: {
          select: {
            sources: true,
            subtitles: true,
          },
        },
      },
    });

    // Handle poster upload if provided
    if (posterFile) {
      await this.uploadMoviePoster(movie.id, posterFile);
    } else if (posterUrl) {
      await this.updateMoviePosterUrl(movie.id, posterUrl);
    }

    // Handle video upload if provided
    if (videoFile) {
      await this.uploadMovieVideo(movie.id, videoFile);
    } else if (videoUrl) {
      await this.updateMovieVideoUrl(movie.id, videoUrl);
    }

    // Index in search engine (optional)
    try {
      if (this.meilisearch) {
        await this.meilisearch.indexMovie(movie);
      }
    } catch (error) {
      console.error("Failed to index movie in search engine:", error);
    }

    return this.findOne(movie.id);
  }

  // Update movie with enhanced data and poster handling
  async update(id: string, updateMovieDto: UpdateMovieDto) {
    const {
      genreIds,
      tagIds,
      credits,
      countries,

      posterFile,
      posterUrl,
      videoFile,
      videoUrl,
      ...movieData
    } = updateMovieDto;

    // Remove posterUrl from movieData since it's not a database field
    // posterUrl is only used for poster file handling, not for movie data updates
    delete (movieData as any).posterUrl;

    // Check if movie exists
    const existingMovie = await this.prisma.movie.findUnique({
      where: { id },
      include: {
        genres: true,
        tags: true,
        credits: true,
        countries: true,
        artworks: true,
      },
    });

    if (!existingMovie) {
      throw new NotFoundException(`Movie with ID ${id} not found`);
    }

    // Filter out invalid credits (personId must exist in database)
    let validCredits = undefined;
    if (credits && credits.length > 0) {
      const personIds = credits.map((c) => c.personId).filter(Boolean);
      if (personIds.length > 0) {
        const existingPeople = await this.prisma.person.findMany({
          where: { id: { in: personIds } },
          select: { id: true },
        });
        const validPersonIds = new Set(existingPeople.map((p) => p.id));
        validCredits = credits.filter(
          (credit) =>
            credit.personId &&
            credit.role &&
            validPersonIds.has(credit.personId)
        );
      }
    }

    const movie = await this.prisma.movie.update({
      where: { id },
      data: {
        ...movieData,
        genres: genreIds
          ? {
              deleteMany: {},
              create: genreIds.map((genreId) => ({
                genre: { connect: { id: genreId } },
              })),
            }
          : undefined,
        tags: tagIds
          ? {
              deleteMany: {},
              create: tagIds.map((tagId) => ({
                tag: { connect: { id: tagId } },
              })),
            }
          : undefined,
        credits:
          validCredits && validCredits.length > 0
            ? {
                deleteMany: {},
                create: validCredits.map((credit) => ({
                  person: { connect: { id: credit.personId } },
                  role: credit.role,
                })),
              }
            : undefined,
        countries: countries
          ? {
              deleteMany: {},
              create: countries.map((countryId: string) => ({
                country: { connect: { id: countryId } },
              })),
            }
          : undefined,
      },
      include: {
        genres: { include: { genre: true } },
        tags: { include: { tag: true } },
        credits: { include: { person: true } },
        artworks: true,
        _count: {
          select: {
            sources: true,
            subtitles: true,
          },
        },
      },
    });

    // Handle poster update if provided
    if (posterFile) {
      await this.updateMoviePoster(id, posterFile);
    } else if (posterUrl) {
      await this.updateMoviePosterUrl(id, posterUrl);
    }

    // Handle video update if provided
    if (videoFile) {
      await this.uploadMovieVideo(id, videoFile);
    } else if (videoUrl) {
      await this.updateMovieVideoUrl(id, videoUrl);
    }

    // Update search index (optional)
    try {
      if (this.meilisearch) {
        await this.meilisearch.updateMovie(id, movie);
      }
    } catch (error) {
      console.error("Failed to update movie in search engine:", error);
    }

    return this.findOne(id);
  }

  // Delete movie with cleanup
  async delete(id: string) {
    const movie = await this.prisma.movie.findUnique({
      where: { id },
      include: { artworks: true },
    });

    if (!movie) {
      throw new NotFoundException(`Movie with ID ${id} not found`);
    }

    // Delete associated artworks from S3
    for (const artwork of movie.artworks) {
      try {
        await this.storage.deleteFile(artwork.url);
      } catch (error) {
        console.error(`Failed to delete artwork ${artwork.id} from S3:`, error);
      }
    }

    // Delete from database (cascade will handle related records)
    const deletedMovie = await this.prisma.movie.delete({
      where: { id },
      include: {
        genres: { include: { genre: true } },
        tags: { include: { tag: true } },
        credits: { include: { person: true } },
        countries: { include: { country: true } },
        artworks: true,
      },
    });

    // Remove from search index (optional)
    try {
      if (this.meilisearch) {
        await this.meilisearch.deleteMovie(id);
      }
    } catch (error) {
      console.error("Failed to delete movie from search engine:", error);
    }

    return deletedMovie;
  }

  // Artwork Management
  async createArtwork(movieId: string, createArtworkDto: CreateArtworkDto) {
    // Verify movie exists
    const movie = await this.prisma.movie.findUnique({
      where: { id: movieId },
    });

    if (!movie) {
      throw new NotFoundException(`Movie with ID ${movieId} not found`);
    }

    // Create artwork record
    const artwork = await this.prisma.artwork.create({
      data: {
        ...createArtworkDto,
        movieId,
        url: "", // Will be updated after upload
      },
    });

    return artwork;
  }

  async generateArtworkUploadUrl(
    movieId: string,
    artworkId: string,
    uploadData: { contentType: string; filename: string }
  ) {
    // Verify movie and artwork exist
    const [movie, artwork] = await Promise.all([
      this.prisma.movie.findUnique({ where: { id: movieId } }),
      this.prisma.artwork.findUnique({ where: { id: artworkId } }),
    ]);

    if (!movie) {
      throw new NotFoundException(`Movie with ID ${movieId} not found`);
    }

    if (!artwork) {
      throw new NotFoundException(`Artwork with ID ${artworkId} not found`);
    }

    if (artwork.movieId !== movieId) {
      throw new BadRequestException(
        "Artwork does not belong to the specified movie"
      );
    }

    // Generate S3 upload path
    const key = this.storage.generatePath(
      artwork.kind as any,
      uploadData.filename
    );

    // Generate presigned upload URL
    const { url, fields } = await this.storage.generatePresignedUploadUrl(
      key,
      uploadData.contentType,
      3600 // 1 hour
    );

    // Update artwork with the S3 key
    await this.prisma.artwork.update({
      where: { id: artworkId },
      data: { url: key },
    });

    return {
      artwork: {
        ...artwork,
        url: key,
      },
      uploadUrl: url,
      fields,
    };
  }

  async deleteArtwork(movieId: string, artworkId: string) {
    // Verify movie and artwork exist
    const [movie, artwork] = await Promise.all([
      this.prisma.movie.findUnique({ where: { id: movieId } }),
      this.prisma.artwork.findUnique({ where: { id: artworkId } }),
    ]);

    if (!movie) {
      throw new NotFoundException(`Movie with ID ${movieId} not found`);
    }

    if (!artwork) {
      throw new NotFoundException(`Artwork with ID ${artworkId} not found`);
    }

    if (artwork.movieId !== movieId) {
      throw new BadRequestException(
        "Artwork does not belong to the specified movie"
      );
    }

    // Delete from S3
    if (artwork.url) {
      try {
        await this.storage.deleteFile(artwork.url);
      } catch (error) {
        console.error(`Failed to delete artwork ${artworkId} from S3:`, error);
      }
    }

    // Delete from database
    await this.prisma.artwork.delete({
      where: { id: artworkId },
    });

    return { success: true };
  }

  // Bulk Operations
  async bulkImport(file: Express.Multer.File) {
    // This is a placeholder implementation
    // In a real implementation, you would parse the file and create movies
    console.log("Bulk import file:", file.originalname);

    // For now, return a mock result
    return {
      success: 0,
      failed: 0,
      errors: [],
    };
  }

  async bulkUpdateStatus(movieIds: string[], status: MovieStatus) {
    const result = await this.prisma.movie.updateMany({
      where: { id: { in: movieIds } },
      data: { status },
    });

    // Update search index for affected movies
    try {
      const updatedMovies = await this.prisma.movie.findMany({
        where: { id: { in: movieIds } },
      });

      for (const movie of updatedMovies) {
        await this.meilisearch.updateMovie(movie.id, movie);
      }
    } catch (error) {
      console.error("Failed to update movies in search engine:", error);
    }

    return result;
  }

  async bulkDelete(movieIds: string[]) {
    // Get movies with artworks for S3 cleanup
    const movies = await this.prisma.movie.findMany({
      where: { id: { in: movieIds } },
      include: { artworks: true },
    });

    // Delete artworks from S3
    for (const movie of movies) {
      for (const artwork of movie.artworks) {
        try {
          await this.storage.deleteFile(artwork.url);
        } catch (error) {
          console.error(
            `Failed to delete artwork ${artwork.id} from S3:`,
            error
          );
        }
      }
    }

    // Delete from database
    const result = await this.prisma.movie.deleteMany({
      where: { id: { in: movieIds } },
    });

    // Remove from search index
    try {
      for (const movieId of movieIds) {
        await this.meilisearch.deleteMovie(movieId);
      }
    } catch (error) {
      console.error("Failed to delete movies from search engine:", error);
    }

    return result;
  }

  async getStats() {
    const [
      totalMovies,
      publishedMovies,
      draftMovies,
      moviesWithoutPoster,
      moviesWithoutSources,
      recentlyAdded,
      yearDistribution,
    ] = await Promise.all([
      this.prisma.movie.count(),
      this.prisma.movie.count({ where: { status: "published" } }),
      this.prisma.movie.count({ where: { status: "draft" } }),
      this.prisma.movie.count({
        where: {
          artworks: {
            none: { kind: "poster" },
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

      yearDistribution,
      completionRate:
        totalMovies > 0 ? (publishedMovies / totalMovies) * 100 : 0,
    };
  }

  // Poster-specific methods
  async uploadMoviePoster(movieId: string, posterFile: Express.Multer.File) {
    // Verify movie exists
    const movie = await this.prisma.movie.findUnique({
      where: { id: movieId },
    });

    if (!movie) {
      throw new NotFoundException(`Movie with ID ${movieId} not found`);
    }

    // Generate S3 path for poster
    const key = this.storage.generatePath("poster", posterFile.originalname);

    // Upload to S3
    await this.storage.uploadFile(key, posterFile.buffer, posterFile.mimetype);

    // Create or update artwork record
    const existingPoster = await this.prisma.artwork.findFirst({
      where: { movieId, kind: "poster" },
    });

    if (existingPoster) {
      // Delete old poster from S3
      if (existingPoster.url) {
        try {
          await this.storage.deleteFile(existingPoster.url);
        } catch (error) {
          console.error("Failed to delete old poster from S3:", error);
        }
      }

      // Update existing poster
      await this.prisma.artwork.update({
        where: { id: existingPoster.id },
        data: { url: key },
      });
    } else {
      // Create new poster artwork
      await this.prisma.artwork.create({
        data: {
          movieId,
          kind: "poster",
          url: key,
          width: undefined, // Could extract from image metadata
          height: undefined,
        },
      });
    }

    return { success: true, posterUrl: key };
  }

  async updateMoviePoster(movieId: string, posterFile: Express.Multer.File) {
    return this.uploadMoviePoster(movieId, posterFile);
  }

  async updateMoviePosterUrl(movieId: string, posterUrl: string) {
    // Verify movie exists
    const movie = await this.prisma.movie.findUnique({
      where: { id: movieId },
    });

    if (!movie) {
      throw new NotFoundException(`Movie with ID ${movieId} not found`);
    }

    // Create or update artwork record
    const existingPoster = await this.prisma.artwork.findFirst({
      where: { movieId, kind: "poster" },
    });

    if (existingPoster) {
      await this.prisma.artwork.update({
        where: { id: existingPoster.id },
        data: { url: posterUrl },
      });
    } else {
      await this.prisma.artwork.create({
        data: {
          movieId,
          kind: "poster",
          url: posterUrl,
        },
      });
    }

    return { success: true, posterUrl };
  }

  async deleteMoviePoster(movieId: string) {
    // Verify movie exists
    const movie = await this.prisma.movie.findUnique({
      where: { id: movieId },
    });

    if (!movie) {
      throw new NotFoundException(`Movie with ID ${movieId} not found`);
    }

    // Find and delete poster artwork
    const poster = await this.prisma.artwork.findFirst({
      where: { movieId, kind: "poster" },
    });

    if (poster) {
      // Delete from S3 if it's an S3 URL
      if (poster.url && !poster.url.startsWith("http")) {
        try {
          await this.storage.deleteFile(poster.url);
        } catch (error) {
          console.error("Failed to delete poster from S3:", error);
        }
      }

      // Delete from database
      await this.prisma.artwork.delete({
        where: { id: poster.id },
      });
    }

    return { success: true };
  }

  // Generate poster upload URL for frontend
  async generatePosterUploadUrl(
    movieId: string,
    filename: string,
    contentType: string
  ) {
    // Verify movie exists
    const movie = await this.prisma.movie.findUnique({
      where: { id: movieId },
    });

    if (!movie) {
      throw new NotFoundException(`Movie with ID ${movieId} not found`);
    }

    // Generate S3 path
    const key = this.storage.generatePath("poster", filename);

    // Generate presigned upload URL
    const { url, fields } = await this.storage.generatePresignedUploadUrl(
      key,
      contentType,
      3600 // 1 hour
    );

    // Create or update artwork record
    const existingPoster = await this.prisma.artwork.findFirst({
      where: { movieId, kind: "poster" },
    });

    if (existingPoster) {
      // Delete old poster from S3
      if (existingPoster.url && !existingPoster.url.startsWith("http")) {
        try {
          await this.storage.deleteFile(existingPoster.url);
        } catch (error) {
          console.error("Failed to delete old poster from S3:", error);
        }
      }

      // Update existing poster
      await this.prisma.artwork.update({
        where: { id: existingPoster.id },
        data: { url: key },
      });
    } else {
      // Create new poster artwork
      await this.prisma.artwork.create({
        data: {
          movieId,
          kind: "poster",
          url: key,
        },
      });
    }

    return {
      uploadUrl: url,
      fields,
      posterUrl: key,
      artworkId: existingPoster?.id || "new",
    };
  }

  // Video-specific methods
  async uploadMovieVideo(movieId: string, videoFile: Express.Multer.File) {
    // Verify movie exists
    const movie = await this.prisma.movie.findUnique({
      where: { id: movieId },
    });

    if (!movie) {
      throw new NotFoundException(`Movie with ID ${movieId} not found`);
    }

    // Generate S3 path for video
    const key = this.storage.generatePath("video", videoFile.originalname);

    // Upload to S3
    await this.storage.uploadFile(key, videoFile.buffer, videoFile.mimetype);

    // Create source record with S3 key (not full URL)
    await this.prisma.source.create({
      data: {
        movieId,
        type: this.getVideoTypeFromMimeType(videoFile.mimetype),
        url: key, // Store S3 key instead of full URL
        quality: this.getQualityFromFile(videoFile),
        isActive: true,
      },
    });

    return { success: true, videoUrl: key };
  }

  async updateMovieVideoUrl(movieId: string, videoUrl: string) {
    // Verify movie exists
    const movie = await this.prisma.movie.findUnique({
      where: { id: movieId },
    });

    if (!movie) {
      throw new NotFoundException(`Movie with ID ${movieId} not found`);
    }

    // Create or update source record
    const existingSource = await this.prisma.source.findFirst({
      where: { movieId, type: "mp4" },
    });

    if (existingSource) {
      await this.prisma.source.update({
        where: { id: existingSource.id },
        data: {
          url: videoUrl,
        },
      });
    } else {
      await this.prisma.source.create({
        data: {
          movieId,
          type: "mp4",
          url: videoUrl,
          quality: "1080p",
          isActive: true,
        },
      });
    }

    return { success: true, videoUrl };
  }

  async deleteMovieVideo(movieId: string, sourceId?: string) {
    // Verify movie exists
    const movie = await this.prisma.movie.findUnique({
      where: { id: movieId },
    });

    if (!movie) {
      throw new NotFoundException(`Movie with ID ${movieId} not found`);
    }

    // Find sources to delete
    const sources = sourceId
      ? await this.prisma.source.findMany({
          where: { id: sourceId, movieId },
        })
      : await this.prisma.source.findMany({
          where: { movieId },
        });

    for (const source of sources) {
      // Delete from S3 if it's an S3 URL
      if (source.url && !source.url.startsWith("http")) {
        try {
          await this.storage.deleteFile(source.url);
        } catch (error) {
          console.error("Failed to delete video from S3:", error);
        }
      }

      // Delete from database
      await this.prisma.source.delete({
        where: { id: source.id },
      });
    }

    return { success: true };
  }

  // Helper methods
  private getVideoTypeFromMimeType(mimeType: string): string {
    if (mimeType.includes("mp4")) return "mp4";
    if (mimeType.includes("webm")) return "webm";
    if (mimeType.includes("mov")) return "mov";
    if (mimeType.includes("avi")) return "avi";
    return "mp4"; // default
  }

  private getQualityFromFile(file: Express.Multer.File): string {
    // Simple quality detection based on file size
    const sizeInMB = file.size / (1024 * 1024);

    if (sizeInMB > 1000) return "4k";
    if (sizeInMB > 500) return "1080p";
    if (sizeInMB > 200) return "720p";
    return "480p";
  }
}
