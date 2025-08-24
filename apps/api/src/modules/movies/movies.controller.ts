import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { nanoid } from 'nanoid';
import { PlayAuthResponseDto } from './dto/play-auth.dto';

class ListDto {
  page?: number = 1;
  limit?: number = 24;
  genre?: string;
  year?: number;
  sort?: string = 'popular';
}

@ApiTags('Movies')
@Controller('movies')
export class MoviesController {
  @Get()
  @ApiOperation({ summary: 'List movies with filters and pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 24)' })
  @ApiQuery({ name: 'genre', required: false, type: String, description: 'Filter by genre' })
  @ApiQuery({ name: 'year', required: false, type: Number, description: 'Filter by year' })
  @ApiQuery({ name: 'sort', required: false, type: String, description: 'Sort by: popular, rating, year, title' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of movies with pagination',
    schema: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              slug: { type: 'string' },
              title: { type: 'string' },
              poster: { type: 'string' },
              year: { type: 'number' },
              rating: { type: 'number' },
              genres: { type: 'array', items: { type: 'string' } }
            }
          }
        },
        page: { type: 'number' },
        limit: { type: 'number' },
        total: { type: 'number' },
        hasMore: { type: 'boolean' }
      }
    }
  })
  async list(@Query() q: ListDto) {
    // TODO: 从 DB 获取数据，现在返回 mock 数据
    const mockMovies = [
      { id: 'm1', slug: 'john-wick-4', title: 'John Wick 4', poster: '/cdn/m/m1/poster.jpg', year: 2023, rating: 8.5, genres: ['Action', 'Thriller'] },
      { id: 'm2', slug: 'dune', title: 'Dune', poster: '/cdn/m/m2/poster.jpg', year: 2021, rating: 8.0, genres: ['Sci-Fi', 'Adventure'] },
      { id: 'm3', slug: 'spider-man-no-way-home', title: 'Spider-Man: No Way Home', poster: '/cdn/m/m3/poster.jpg', year: 2021, rating: 8.2, genres: ['Action', 'Adventure'] },
      { id: 'm4', slug: 'the-batman', title: 'The Batman', poster: '/cdn/m/m4/poster.jpg', year: 2022, rating: 7.8, genres: ['Action', 'Crime'] },
      { id: 'm5', slug: 'pook-gerd-tee-muen', title: 'ปุกเกิด ตีหมื่น', poster: '/cdn/m/m5/poster.jpg', year: 2023, rating: 7.5, genres: ['Comedy', 'Action'] },
      { id: 'm6', slug: 'luang-pee-jazz-5g', title: 'หลวงพี่แจ๊ส 5G', poster: '/cdn/m/m6/poster.jpg', year: 2023, rating: 7.2, genres: ['Comedy'] },
      { id: 'm7', slug: 'fast-x', title: 'Fast X', poster: '/cdn/m/m7/poster.jpg', year: 2023, rating: 6.8, genres: ['Action', 'Thriller'] },
      { id: 'm8', slug: 'guardians-of-the-galaxy-vol-3', title: 'Guardians of the Galaxy Vol. 3', poster: '/cdn/m/m8/poster.jpg', year: 2023, rating: 8.1, genres: ['Action', 'Comedy'] },
      { id: 'm9', slug: 'scream-vi', title: 'Scream VI', poster: '/cdn/m/m9/poster.jpg', year: 2023, rating: 6.5, genres: ['Horror', 'Thriller'] },
      { id: 'm10', slug: 'avatar-the-way-of-water', title: 'Avatar: The Way of Water', poster: '/cdn/m/m10/poster.jpg', year: 2022, rating: 7.6, genres: ['Sci-Fi', 'Adventure'] },
      { id: 'm11', slug: 'black-panther-wakanda-forever', title: 'Black Panther: Wakanda Forever', poster: '/cdn/m/m11/poster.jpg', year: 2022, rating: 6.7, genres: ['Action', 'Adventure'] },
      { id: 'm12', slug: 'top-gun-maverick', title: 'Top Gun: Maverick', poster: '/cdn/m/m12/poster.jpg', year: 2022, rating: 8.3, genres: ['Action', 'Drama'] },
      { id: 'm13', slug: 'doctor-strange-multiverse', title: 'Doctor Strange in the Multiverse of Madness', poster: '/cdn/m/m13/poster.jpg', year: 2022, rating: 6.9, genres: ['Action', 'Fantasy'] },
      { id: 'm14', slug: 'thor-love-and-thunder', title: 'Thor: Love and Thunder', poster: '/cdn/m/m14/poster.jpg', year: 2022, rating: 6.2, genres: ['Action', 'Comedy'] },
      { id: 'm15', slug: 'inhuman-kiss', title: 'แสงกระสือ', poster: '/cdn/m/m15/poster.jpg', year: 2019, rating: 6.8, genres: ['Horror', 'Romance'] },
      { id: 'm16', slug: 'my-house', title: 'บ้านฉัน ตลกไว้ก่อน (พ่อสอนไว้)', poster: '/cdn/m/m16/poster.jpg', year: 2020, rating: 7.1, genres: ['Comedy'] },
      { id: 'm17', slug: 'demon-slayer-mugen-train', title: 'Demon Slayer: Mugen Train', poster: '/cdn/m/m17/poster.jpg', year: 2020, rating: 8.7, genres: ['Animation', 'Action'] },
      { id: 'm18', slug: 'your-name', title: 'Your Name', poster: '/cdn/m/m18/poster.jpg', year: 2016, rating: 8.4, genres: ['Animation', 'Romance'] },
      { id: 'm19', slug: 'oppenheimer', title: 'Oppenheimer', poster: '/cdn/m/m19/poster.jpg', year: 2023, rating: 8.4, genres: ['Biography', 'Drama'] },
      { id: 'm20', slug: 'barbie', title: 'Barbie', poster: '/cdn/m/m20/poster.jpg', year: 2023, rating: 6.9, genres: ['Comedy', 'Adventure'] }
    ];

    // Apply filters
    let filteredMovies = mockMovies;
    
    if (q.genre) {
      filteredMovies = filteredMovies.filter(movie => 
        movie.genres.some(genre => genre.toLowerCase().includes(q.genre!.toLowerCase()))
      );
    }
    
    if (q.year) {
      filteredMovies = filteredMovies.filter(movie => movie.year === q.year);
    }

    // Apply sorting
    switch (q.sort) {
      case 'rating':
        filteredMovies.sort((a, b) => b.rating - a.rating);
        break;
      case 'year':
        filteredMovies.sort((a, b) => b.year - a.year);
        break;
      case 'title':
        filteredMovies.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default: // popular
        filteredMovies.sort((a, b) => b.rating - a.rating);
    }

    // Apply pagination
    const page = q.page || 1;
    const limit = q.limit || 24;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedMovies = filteredMovies.slice(startIndex, endIndex);

    return { 
      items: paginatedMovies,
      page: page, 
      limit: limit, 
      total: filteredMovies.length, 
      hasMore: endIndex < filteredMovies.length 
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get movie details by ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Movie details',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        originalTitle: { type: 'string' },
        year: { type: 'number' },
        runtime: { type: 'number' },
        rating: { type: 'number' },
        synopsis: { type: 'string' },
        poster: { type: 'string' },
        backdrop: { type: 'string' },
        genres: { type: 'array', items: { type: 'string' } },
        tags: { type: 'array', items: { type: 'string' } },
        cast: { type: 'array' },
        crew: { type: 'array' },
        related: { type: 'array' }
      }
    }
  })
  async detail(@Param('id') id: string) {
    // TODO: 从 DB 获取数据，现在返回 mock 数据
    const mockMovieDetails: Record<string, any> = {
      'm2': {
        id: 'm2',
        title: 'Dune',
        originalTitle: 'Dune',
        year: 2021,
        runtime: 155,
        rating: 8.0,
        synopsis: 'ในอนาคตอันไกลโพ้น ดุ๊ค เลโต้ ได้รับมอบหมายให้ปกครองดาวอารากิส ดาวทะเลทรายอันแห้งแล้งที่เป็นแหล่งผลิตเครื่องเทศที่มีค่าที่สุดในจักรวาล แต่เมื่อเขาถูกทรยศ พอล ลูกชายของเขาและเลดี้ เจสสิกา ต้องหลบหนีเข้าไปในทะเลทราย',
        poster: '/cdn/m/m2/poster.jpg',
        backdrop: '/cdn/m/m2/backdrop.jpg',
        genres: ['Sci-Fi', 'Adventure', 'Drama'],
        tags: ['พากย์ไทย', 'ซับไทย', 'IMAX'],
        cast: [
          { id: 'p1', name: 'Timothée Chalamet', character: 'Paul Atreides' },
          { id: 'p2', name: 'Rebecca Ferguson', character: 'Lady Jessica' },
          { id: 'p3', name: 'Oscar Isaac', character: 'Duke Leto Atreides' },
          { id: 'p4', name: 'Josh Brolin', character: 'Gurney Halleck' },
          { id: 'p5', name: 'Stellan Skarsgård', character: 'Baron Vladimir Harkonnen' }
        ],
        crew: [
          { id: 'p9', name: 'Denis Villeneuve', role: 'Director' },
          { id: 'p10', name: 'Jon Spaihts', role: 'Writer' },
          { id: 'p11', name: 'Eric Roth', role: 'Writer' }
        ],
        related: [
          { id: 'm10', title: 'Blade Runner 2049', poster: '/cdn/m/m10/poster.jpg', year: 2017, rating: 8.0 },
          { id: 'm19', title: 'Arrival', poster: '/cdn/m/m19/poster.jpg', year: 2016, rating: 7.9 },
          { id: 'm20', title: 'Interstellar', poster: '/cdn/m/m20/poster.jpg', year: 2014, rating: 8.6 }
        ]
      }
    };

    const movieDetail = mockMovieDetails[id] || {
      id,
      title: 'Unknown Movie',
      originalTitle: 'Unknown Movie',
      year: 2023,
      runtime: 120,
      rating: 7.0,
      synopsis: 'Movie details not found.',
      poster: '/cdn/placeholder/poster.jpg',
      backdrop: '/cdn/placeholder/backdrop.jpg',
      genres: ['Unknown'],
      tags: [],
      cast: [],
      crew: [],
      related: []
    };

    return movieDetail;
  }

  @Get(':id/play')
  @ApiOperation({ summary: 'Get movie playback authorization and sources' })
  @ApiResponse({ 
    status: 200, 
    description: 'Playback authorization with video sources and metadata',
    type: PlayAuthResponseDto
  })
  async play(@Param('id') id: string): Promise<PlayAuthResponseDto> {
    const ttl = 900; // 15 minutes
    const now = Date.now();
    const base = process.env.PUBLIC_BASE_URL || 'http://localhost:4000';

    return {
      movieId: id,
      ttl,
      expiresAt: new Date(now + ttl * 1000).toISOString(),
      sources: [
        {
          id: 'hls-1080',
          type: 'hls',
          label: '1080p',
          url: `${base}/cdn/placeholder/demo.m3u8`, // 仅 stub
        },
        {
          id: 'hls-720',
          type: 'hls',
          label: '720p',
          url: `${base}/cdn/placeholder/demo-720.m3u8`,
        },
      ],
      subtitles: [
        { lang: 'th', label: 'ไทย', url: `${base}/cdn/placeholder/th.vtt` },
        { lang: 'en', label: 'English', url: `${base}/cdn/placeholder/en.vtt` },
      ],
      overlays: [
        {
          type: 'image',
          placement: 'tr',
          start: 10,
          end: 30,
          url: `${base}/cdn/sponsors/ez-casino.png`,
          href: 'https://example.com',
          opacity: 0.9,
        },
      ],
      analytics: { heartbeat: 30 },
    };
  }
}