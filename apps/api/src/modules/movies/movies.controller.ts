import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";
import { PlayAuthResponseDto } from "./dto/play-auth.dto";
import { MovieService } from "../content/movie.service";

class ListDto {
  page?: number = 1;
  limit?: number = 24;
  genre?: string;
  year?: number;
  sort?: string = "popular";
}

@ApiTags("Movies")
@Controller("movies")
export class MoviesController {
  constructor(private readonly movieService: MovieService) {}

  @Get()
  @ApiOperation({ summary: "List movies with filters and pagination" })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    description: "Page number (default: 1)",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Items per page (default: 24)",
  })
  @ApiQuery({
    name: "genreId",
    required: false,
    type: String,
    description: "Filter by genreId",
  })
  @ApiQuery({
    name: "tagId",
    required: false,
    type: String,
    description: "Filter by tagId",
  })
  @ApiQuery({
    name: "castId",
    required: false,
    type: String,
    description: "Filter by cast personId",
  })
  @ApiQuery({
    name: "countryId",
    required: false,
    type: String,
    description: "Filter by countryId",
  })
  @ApiQuery({
    name: "year",
    required: false,
    type: Number,
    description: "Filter by year",
  })
  @ApiQuery({
    name: "sort",
    required: false,
    type: String,
    description: "Sort by: popular, rating, year, title",
  })
  @ApiResponse({
    status: 200,
    description: "List of movies with pagination",
  })
  async list(
    @Query()
    q: ListDto & {
      genreId?: string;
      tagId?: string;
      castId?: string;
      countryId?: string;
      genreName?: string;
      tagName?: string;
      castName?: string;
      countryCode?: string;
      countryName?: string;
    }
  ) {
    const page = Number(q.page ?? 1);
    const limit = Number(q.limit ?? 24);
    const sortMap: Record<string, string> = {
      rating: "rating",
      year: "year",
      title: "title",
      popular: "updatedAt",
      banner: "updatedAt",
    };
    const sortBy = sortMap[q.sort || "popular"] || "updatedAt";

    // Workaround: when sort=banner, return movies tagged with code 'BANNER'
    // Admins can assign the 'BANNER' tag to control this set from the admin panel
    let effectiveTagId = q.tagId;
    if (q.sort === "banner" && !effectiveTagId) {
      try {
        // lazy import to avoid circulars
        const prismaModule = await import("../prisma/prisma.service");
        const { PrismaService } = prismaModule as any;
        const prisma = new PrismaService();
        const bannerTag = await prisma.tag.findFirst({
          where: { code: "BANNER" },
        });
        if (bannerTag) {
          effectiveTagId = bannerTag.id;
        }
      } catch (_) {
        // ignore and fall back to no tag filter
      }
    }

    // Resolve friendly names to IDs if provided
    let effectiveGenreId = q.genreId;
    let effectiveCountryId = q.countryId;
    let effectiveCastId = q.castId;
    if (
      !effectiveTagId ||
      !effectiveGenreId ||
      !effectiveCountryId ||
      !effectiveCastId
    ) {
      try {
        const prismaModule = await import("../prisma/prisma.service");
        const { PrismaService } = prismaModule as any;
        const prisma = new PrismaService();
        if (!effectiveTagId && q.tagName) {
          // Try code first (uppercased), then case-insensitive name match
          const byCode = await prisma.tag.findUnique({
            where: { code: q.tagName.toUpperCase() },
          });
          if (byCode) {
            effectiveTagId = byCode.id;
          } else {
            const byName = await prisma.tag.findFirst({
              where: { name: { equals: q.tagName, mode: "insensitive" } },
            });
            if (byName) effectiveTagId = byName.id;
          }
        }
        if (!effectiveGenreId && q.genreName) {
          const g = await prisma.genre.findFirst({
            where: { name: { equals: q.genreName, mode: "insensitive" } },
          });
          if (g) effectiveGenreId = g.id;
        }
        if (!effectiveCountryId && (q.countryCode || q.countryName)) {
          const c = q.countryCode
            ? await prisma.country.findUnique({
                where: { code: (q.countryCode || "").toUpperCase() },
              })
            : await prisma.country.findFirst({
                where: {
                  name: { equals: q.countryName as any, mode: "insensitive" },
                },
              });
          if (c) effectiveCountryId = c.id;
        }
        if (!effectiveCastId && q.castName) {
          const p = await prisma.person.findFirst({
            where: { name: { equals: q.castName, mode: "insensitive" } },
          });
          if (p) effectiveCastId = p.id;
        }
      } catch (_) {}
    }

    const result = await this.movieService.findAll({
      status: "published",
      year: q.year ? Number(q.year) : undefined,
      page,
      limit,
      sortBy,
      sortOrder: "desc",
      genreId: effectiveGenreId,
      tagId: effectiveTagId,
      castId: effectiveCastId,
      countryId: effectiveCountryId,
    });

    return {
      items: result.items.map((m: any) => ({
        id: m.id,
        title: m.title,
        year: m.year,
        rating: m.rating ?? null,
        ageRating: m.ageRating ?? null,
        runtime: m.runtime ?? null,
        director: m.director ?? null,
        synopsis: m.synopsis ?? null,
        trailerUrl: m.trailerUrl ?? null,
        poster: m.posterUrl || null,
        logo: m.logoUrl || null,
        backdrop:
          (m.artworks || []).find((a: any) => a.kind === "backdrop")?.url ||
          null,
        genres: (m.genres || [])
          .map((g: any) => ({ id: g.genre?.id, name: g.genre?.name }))
          .filter((x: any) => x.id && x.name),
        tags: (m.tags || [])
          .map((t: any) => ({ id: t.tag?.id, name: t.tag?.name }))
          .filter((x: any) => x.id && x.name),
        casts: (m.credits || [])
          .map((c: any) => ({ id: c.person?.id, name: c.person?.name }))
          .filter((x: any) => x.id && x.name),
      })),
      page: result.page,
      limit: result.limit,
      total: result.total,
      hasMore: result.page * result.limit < result.total,
    };
  }

  @Get(":id")
  @ApiOperation({ summary: "Get movie details by ID" })
  @ApiResponse({
    status: 200,
    description: "Movie details",
    schema: {
      type: "object",
      properties: {
        id: { type: "string" },
        title: { type: "string" },
        originalTitle: { type: "string" },
        year: { type: "number" },
        runtime: { type: "number" },
        rating: { type: "number" },
        synopsis: { type: "string" },
        poster: { type: "string" },
        videoUrl: { type: "string", nullable: true },
        backdrop: { type: "string" },
        genres: { type: "array", items: { type: "string" } },
        tags: { type: "array", items: { type: "string" } },
        cast: { type: "array" },
        crew: { type: "array" },
        related: { type: "array" },
      },
    },
  })
  async detail(@Param("id") id: string) {
    const m: any = await this.movieService.findOne(id);
    const related = await this.movieService.findRelatedByGenres(id, 12);
    return {
      id: m.id,
      title: m.title,
      originalTitle: m.originalTitle,
      year: m.year,
      runtime: m.runtime,
      rating: m.rating ?? null,
      synopsis: m.synopsis,
      poster: m.posterUrl || null,
      logo: m.logoUrl || null,
      videoUrl: m.videoUrl || null,
      backdrop:
        (m.artworks || []).find((a: any) => a.kind === "backdrop")?.url || null,
      genres: (m.genres || [])
        .map((g: any) => ({ id: g.genre?.id, name: g.genre?.name }))
        .filter((x: any) => x.id && x.name),
      tags: (m.tags || [])
        .map((t: any) => ({ id: t.tag?.id, name: t.tag?.name }))
        .filter((x: any) => x.id && x.name),
      cast: (m.credits || [])
        .map((c: any) => ({
          id: c.person?.id,
          name: c.person?.name,
          role: c.role,
        }))
        .filter((x: any) => x.id && x.name),
      related,
    };
  }

  @Get(":id/play")
  @ApiOperation({ summary: "Get movie playback authorization and sources" })
  @ApiResponse({
    status: 200,
    description: "Playback authorization with video sources and metadata",
    type: PlayAuthResponseDto,
  })
  async play(@Param("id") id: string): Promise<PlayAuthResponseDto> {
    const ttl = 900; // 15 minutes
    const now = Date.now();
    const base = process.env.PUBLIC_BASE_URL || "http://51.79.254.237:4000";

    // Prefer HLS master and also include MP4 fallback so the player can recover
    let sources: Array<any> = [];
    try {
      const prismaModule = await import("../prisma/prisma.service");
      const { PrismaService } = prismaModule as any;
      const prisma = new PrismaService();

      const movie = await prisma.movie.findUnique({
        where: { id },
        include: {
          sources: { where: { isActive: true }, orderBy: { quality: "desc" } },
        },
      });

      const hlsMasterKey = `hls/${id}/master.m3u8`;
      sources.push({
        id: "hls",
        type: "hls",
        label: "Auto",
        url: `${base}/cdn/${hlsMasterKey}`,
      });

      // Fallback MP4 source
      const mp4 = movie?.sources?.find(
        (s: any) => (s.type || "").toLowerCase() === "mp4"
      );
      if (mp4?.url) {
        const isHttp = mp4.url.startsWith("http");
        const mp4Url = isHttp ? mp4.url : `${base}/cdn/${mp4.url}`;
        sources.push({
          id: "mp4",
          type: "mp4",
          label: mp4.quality || "1080p",
          url: mp4Url,
        });
      }
    } catch (_) {
      // As a last resort, keep a placeholder demo so the player doesn't break completely
      sources = [
        {
          id: "demo",
          type: "hls",
          label: "Demo",
          url: `${base}/cdn/placeholder/demo.m3u8`,
        },
      ];
    }

    return {
      movieId: id,
      ttl,
      expiresAt: new Date(now + ttl * 1000).toISOString(),
      sources,
      subtitles: [],
      overlays: [],
      analytics: { heartbeat: 30 },
    };
  }
}
