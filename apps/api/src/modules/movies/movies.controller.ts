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
    }
  ) {
    const page = Number(q.page ?? 1);
    const limit = Number(q.limit ?? 24);
    const sortMap: Record<string, string> = {
      rating: "rating",
      year: "year",
      title: "title",
      popular: "updatedAt",
    };
    const sortBy = sortMap[q.sort || "popular"] || "updatedAt";

    const result = await this.movieService.findAll({
      status: "published",
      year: q.year ? Number(q.year) : undefined,
      page,
      limit,
      sortBy,
      sortOrder: "desc",
      genreId: q.genreId,
      tagId: q.tagId,
      castId: q.castId,
      countryId: q.countryId,
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
        poster: m.posterUrl || null,
        backdrop:
          (m.artworks || []).find((a: any) => a.kind === "backdrop")?.url ||
          null,
        genres: (m.genres || []).map((g: any) => g.genre?.name).filter(Boolean),
        tags: (m.tags || []).map((t: any) => t.tag?.name).filter(Boolean),
        casts: (m.credits || [])
          .map((c: any) => c.person?.name)
          .filter(Boolean),
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
    return {
      id: m.id,
      title: m.title,
      originalTitle: m.originalTitle,
      year: m.year,
      runtime: m.runtime,
      rating: m.rating ?? null,
      synopsis: m.synopsis,
      poster: m.posterUrl || null,
      backdrop:
        (m.artworks || []).find((a: any) => a.kind === "backdrop")?.url || null,
      genres: (m.genres || []).map((g: any) => g.genre?.name).filter(Boolean),
      tags: (m.tags || []).map((t: any) => t.tag?.name).filter(Boolean),
      cast: (m.credits || [])
        .map((c: any) => ({
          id: c.person?.id,
          name: c.person?.name,
          role: c.role,
        }))
        .filter((x: any) => x.id && x.name),
      related: [],
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

    return {
      movieId: id,
      ttl,
      expiresAt: new Date(now + ttl * 1000).toISOString(),
      sources: [
        {
          id: "hls-1080",
          type: "hls",
          label: "1080p",
          url: `${base}/cdn/placeholder/demo.m3u8`, // 仅 stub
        },
        {
          id: "hls-720",
          type: "hls",
          label: "720p",
          url: `${base}/cdn/placeholder/demo-720.m3u8`,
        },
      ],
      subtitles: [
        { lang: "th", label: "ไทย", url: `${base}/cdn/placeholder/th.vtt` },
        { lang: "en", label: "English", url: `${base}/cdn/placeholder/en.vtt` },
      ],
      overlays: [
        {
          type: "image",
          placement: "tr",
          start: 10,
          end: 30,
          url: `${base}/cdn/sponsors/ez-casino.png`,
          href: "https://example.com",
          opacity: 0.9,
        },
      ],
      analytics: { heartbeat: 30 },
    };
  }
}
