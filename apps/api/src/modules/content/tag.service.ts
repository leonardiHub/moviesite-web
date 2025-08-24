import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TagService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.tag.findMany({
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
    const tag = await this.prisma.tag.findUnique({
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

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    return {
      ...tag,
      movies: tag.movies.map(mt => mt.movie),
      series: tag.series.map(st => st.series),
      totalContent: tag._count.movies + tag._count.series,
    };
  }

  async create(data: { name: string }) {
    // Check if tag already exists
    const existingTag = await this.prisma.tag.findUnique({
      where: { name: data.name },
    });

    if (existingTag) {
      throw new ConflictException('Tag with this name already exists');
    }

    return this.prisma.tag.create({
      data: { name: data.name },
    });
  }

  async update(id: string, data: { name: string }) {
    const tag = await this.prisma.tag.findUnique({ where: { id } });
    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    // Check for name conflicts
    if (data.name !== tag.name) {
      const existingTag = await this.prisma.tag.findUnique({
        where: { name: data.name },
      });

      if (existingTag) {
        throw new ConflictException('Tag with this name already exists');
      }
    }

    return this.prisma.tag.update({
      where: { id },
      data: { name: data.name },
    });
  }

  async delete(id: string) {
    const tag = await this.prisma.tag.findUnique({
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

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    const totalUsage = tag._count.movies + tag._count.series;
    if (totalUsage > 0) {
      throw new ConflictException(`Cannot delete tag that is used in ${totalUsage} content items`);
    }

    await this.prisma.tag.delete({ where: { id } });

    return { message: 'Tag deleted successfully' };
  }

  async getPopularTags(limit: number = 20) {
    const tags = await this.prisma.tag.findMany({
      include: {
        _count: {
          select: {
            movies: true,
            series: true,
          },
        },
      },
    });

    return tags
      .map(tag => ({
        ...tag,
        totalContent: tag._count.movies + tag._count.series,
      }))
      .sort((a, b) => b.totalContent - a.totalContent)
      .slice(0, limit);
  }

  async bulkCreate(tagNames: string[]) {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as Array<{ name: string; error: string }>,
    };

    for (const name of tagNames) {
      try {
        await this.create({ name });
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          name,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return results;
  }
}
