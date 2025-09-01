import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GenreService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.genre.findMany({
      include: {
        _count: {
          select: {
            movies: true,
            series: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const genre = await this.prisma.genre.findUnique({
      where: { id },
      include: {
        movies: {
          include: {
            movie: {
              select: {
                id: true,
                title: true,
                year: true,
                artworks: { where: { kind: 'poster' }, take: 1 },
              },
            },
          },
          take: 20,
          orderBy: { movie: { year: 'desc' } },
        },
        series: {
          include: {
            series: {
              select: {
                id: true,
                title: true,
                artworks: { where: { kind: 'poster' }, take: 1 },
              },
            },
          },
          take: 20,
        },
        _count: {
          select: {
            movies: true,
            series: true,
          },
        },
      },
    });

    if (!genre) {
      throw new NotFoundException('Genre not found');
    }

    return {
      ...genre,
      movies: genre.movies.map(mg => mg.movie),
      series: genre.series.map(sg => sg.series),
      totalContent: genre._count.movies + genre._count.series,
    };
  }

  async create(data: { name: string }) {
    // Check if genre already exists
    const existingGenre = await this.prisma.genre.findUnique({
      where: { name: data.name },
    });

    if (existingGenre) {
      throw new ConflictException('Genre with this name already exists');
    }

    // Generate a code from the name
    const code = this.generateGenreCode(data.name);

    return this.prisma.genre.create({
      data: { 
        name: data.name,
        code: code
      },
    });
  }

  async update(id: string, data: { name: string }) {
    const genre = await this.prisma.genre.findUnique({ where: { id } });
    if (!genre) {
      throw new NotFoundException('Genre not found');
    }

    // Check for name conflicts
    if (data.name !== genre.name) {
      const existingGenre = await this.prisma.genre.findUnique({
        where: { name: data.name },
      });

      if (existingGenre) {
        throw new ConflictException('Genre with this name already exists');
      }
    }

    // Generate a new code if name changes
    const code = data.name !== genre.name ? this.generateGenreCode(data.name) : genre.code;

    return this.prisma.genre.update({
      where: { id },
      data: { 
        name: data.name,
        code: code
      },
    });
  }

  async delete(id: string) {
    const genre = await this.prisma.genre.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            movies: true,
            series: true,
          },
        },
      },
    });

    if (!genre) {
      throw new NotFoundException('Genre not found');
    }

    const totalUsage = genre._count.movies + genre._count.series;
    if (totalUsage > 0) {
      throw new ConflictException(`Cannot delete genre that is used in ${totalUsage} content items`);
    }

    await this.prisma.genre.delete({ where: { id } });

    return { message: 'Genre deleted successfully' };
  }

  async getPopularGenres(limit: number = 10) {
    const genres = await this.prisma.genre.findMany({
      include: {
        _count: {
          select: {
            movies: true,
            series: true,
          },
        },
      },
    });

    return genres
      .map(genre => ({
        ...genre,
        totalContent: genre._count.movies + genre._count.series,
      }))
      .sort((a, b) => b.totalContent - a.totalContent)
      .slice(0, limit);
  }

  // Helper method to generate genre code
  private generateGenreCode(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
