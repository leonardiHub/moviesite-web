import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MeilisearchService } from '../meilisearch/meilisearch.service';

@Injectable()
export class PersonService {
  constructor(
    private prisma: PrismaService,
    private meilisearch: MeilisearchService,
  ) {}

  async findAll(filters: {
    search?: string;
    role?: string;
    page?: number;
    limit?: number;
  }) {
    const { search, role, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    if (role) {
      where.credits = {
        some: { role },
      };
    }

    const [people, total] = await Promise.all([
      this.prisma.person.findMany({
        where,
        include: {
          credits: {
            include: {
              movie: { select: { id: true, title: true, year: true } },
              episode: {
                include: {
                  season: {
                    include: {
                      series: { select: { id: true, title: true } },
                    },
                  },
                },
              },
              series: { select: { id: true, title: true } },
            },
          },
          _count: {
            select: { credits: true },
          },
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.person.count({ where }),
    ]);

    return {
      people: people.map(person => ({
        ...person,
        creditsCount: person._count.credits,
        roles: [...new Set(person.credits.map(c => c.role))],
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const person = await this.prisma.person.findUnique({
      where: { id },
      include: {
        credits: {
          include: {
            movie: {
              select: {
                id: true,
                title: true,
                year: true,
                artworks: { where: { kind: 'poster' }, take: 1 },
              },
            },
            episode: {
              include: {
                season: {
                  include: {
                    series: {
                      select: {
                        id: true,
                        title: true,
                        artworks: { where: { kind: 'poster' }, take: 1 },
                      },
                    },
                  },
                },
              },
            },
            series: {
              select: {
                id: true,
                title: true,
                artworks: { where: { kind: 'poster' }, take: 1 },
              },
            },
          },
          orderBy: [{ role: 'asc' }, { movie: { year: 'desc' } }],
        },
      },
    });

    if (!person) {
      throw new NotFoundException('Person not found');
    }

    // Group credits by role
    const creditsByRole = person.credits.reduce((acc, credit) => {
      if (!acc[credit.role]) {
        acc[credit.role] = [];
      }
      acc[credit.role].push(credit);
      return acc;
    }, {} as Record<string, any[]>);

    return {
      ...person,
      creditsByRole,
      totalCredits: person.credits.length,
    };
  }

  async create(data: {
    name: string;
    avatar?: string;
  }) {
    // Check if person already exists
    const existingPerson = await this.prisma.person.findFirst({
      where: { name: { equals: data.name, mode: 'insensitive' } },
    });

    if (existingPerson) {
      throw new ConflictException('Person with this name already exists');
    }

    const person = await this.prisma.person.create({
      data: {
        name: data.name,
        avatar: data.avatar,
      },
    });

    // Index in search
    try {
      await this.meilisearch.indexPerson(person);
    } catch (error) {
      console.error('Failed to index person:', error);
    }

    return person;
  }

  async update(id: string, data: {
    name?: string;
    avatar?: string;
  }) {
    const person = await this.prisma.person.findUnique({ where: { id } });
    if (!person) {
      throw new NotFoundException('Person not found');
    }

    // Check for name conflicts
    if (data.name && data.name !== person.name) {
      const existingPerson = await this.prisma.person.findFirst({
        where: {
          name: { equals: data.name, mode: 'insensitive' },
          id: { not: id },
        },
      });

      if (existingPerson) {
        throw new ConflictException('Person with this name already exists');
      }
    }

    const updatedPerson = await this.prisma.person.update({
      where: { id },
      data,
    });

    // Update search index
    try {
      await this.meilisearch.updatePerson(id, updatedPerson);
    } catch (error) {
      console.error('Failed to update person in search:', error);
    }

    return this.findOne(id);
  }

  async delete(id: string) {
    const person = await this.prisma.person.findUnique({
      where: { id },
      include: {
        _count: { select: { credits: true } },
      },
    });

    if (!person) {
      throw new NotFoundException('Person not found');
    }

    if (person._count.credits > 0) {
      throw new ConflictException('Cannot delete person with existing credits');
    }

    await this.prisma.person.delete({ where: { id } });

    // Remove from search index
    try {
      await this.meilisearch.deletePerson(id);
    } catch (error) {
      console.error('Failed to delete person from search:', error);
    }

    return { message: 'Person deleted successfully' };
  }

  async addCredit(data: {
    personId: string;
    movieId?: string;
    episodeId?: string;
    seriesId?: string;
    role: string;
  }) {
    const person = await this.prisma.person.findUnique({
      where: { id: data.personId },
    });

    if (!person) {
      throw new NotFoundException('Person not found');
    }

    // Validate that only one target is specified
    const targets = [data.movieId, data.episodeId, data.seriesId].filter(Boolean);
    if (targets.length !== 1) {
      throw new BadRequestException('Must specify exactly one target (movie, episode, or series)');
    }

    // Check for duplicate credit
    const existingCredit = await this.prisma.credit.findFirst({
      where: {
        personId: data.personId,
        movieId: data.movieId,
        episodeId: data.episodeId,
        seriesId: data.seriesId,
        role: data.role,
      },
    });

    if (existingCredit) {
      throw new ConflictException('Credit already exists');
    }

    const credit = await this.prisma.credit.create({
      data: {
        personId: data.personId,
        movieId: data.movieId,
        episodeId: data.episodeId,
        seriesId: data.seriesId,
        role: data.role,
      },
    });

    return credit;
  }

  async removeCredit(creditId: string) {
    const credit = await this.prisma.credit.findUnique({
      where: { id: creditId },
    });

    if (!credit) {
      throw new NotFoundException('Credit not found');
    }

    await this.prisma.credit.delete({ where: { id: creditId } });

    return { message: 'Credit removed successfully' };
  }

  async bulkImport(people: Array<{ name: string; avatar?: string }>) {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as Array<{ person: any; error: string }>,
    };

    for (const personData of people) {
      try {
        await this.create(personData);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          person: personData,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return results;
  }

  async getStats() {
    const [
      totalPeople,
      actorsCount,
      directorsCount,
      writersCount,
      peopleWithoutCredits,
      topActors,
      topDirectors,
    ] = await Promise.all([
      this.prisma.person.count(),
      this.prisma.person.count({
        where: { credits: { some: { role: 'actor' } } },
      }),
      this.prisma.person.count({
        where: { credits: { some: { role: 'director' } } },
      }),
      this.prisma.person.count({
        where: { credits: { some: { role: 'writer' } } },
      }),
      this.prisma.person.count({
        where: { credits: { none: {} } },
      }),
      this.prisma.person.findMany({
        where: { credits: { some: { role: 'actor' } } },
        include: {
          _count: { select: { credits: true } },
        },
        orderBy: { credits: { _count: 'desc' } },
        take: 10,
      }),
      this.prisma.person.findMany({
        where: { credits: { some: { role: 'director' } } },
        include: {
          _count: { select: { credits: true } },
        },
        orderBy: { credits: { _count: 'desc' } },
        take: 10,
      }),
    ]);

    return {
      totalPeople,
      actorsCount,
      directorsCount,
      writersCount,
      peopleWithoutCredits,
      topActors: topActors.map(p => ({
        id: p.id,
        name: p.name,
        creditsCount: p._count.credits,
      })),
      topDirectors: topDirectors.map(p => ({
        id: p.id,
        name: p.name,
        creditsCount: p._count.credits,
      })),
    };
  }
}
