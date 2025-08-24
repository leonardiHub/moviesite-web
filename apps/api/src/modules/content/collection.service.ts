import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CollectionService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: {
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { search, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [collections, total] = await Promise.all([
      this.prisma.collection.findMany({
        where,
        include: {
          items: {
            include: {
              movie: {
                select: {
                  id: true,
                  title: true,
                  year: true,
                  artworks: { where: { kind: 'poster' }, take: 1 },
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
            orderBy: { order: 'asc' },
          },
          _count: {
            select: { items: true },
          },
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.collection.count({ where }),
    ]);

    return {
      collections: collections.map(collection => ({
        ...collection,
        itemsCount: collection._count.items,
        items: collection.items.map(item => ({
          ...item,
          content: item.movie || item.series,
        })),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const collection = await this.prisma.collection.findUnique({
      where: { id },
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
        },
      },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    return {
      ...collection,
      items: collection.items.map(item => ({
        ...item,
        content: item.movie || item.series,
      })),
    };
  }

  async create(data: {
    name: string;
    description?: string;
  }) {
    return this.prisma.collection.create({
      data: {
        name: data.name,
        description: data.description,
      },
    });
  }

  async update(id: string, data: {
    name?: string;
    description?: string;
  }) {
    const collection = await this.prisma.collection.findUnique({ where: { id } });
    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    return this.prisma.collection.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    const collection = await this.prisma.collection.findUnique({ where: { id } });
    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    await this.prisma.collection.delete({ where: { id } });

    return { message: 'Collection deleted successfully' };
  }

  async addItem(collectionId: string, data: {
    ownerType: 'movie' | 'series';
    ownerId: string;
    order?: number;
  }) {
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    // Validate content exists
    if (data.ownerType === 'movie') {
      const movie = await this.prisma.movie.findUnique({ where: { id: data.ownerId } });
      if (!movie) {
        throw new NotFoundException('Movie not found');
      }
    } else {
      const series = await this.prisma.series.findUnique({ where: { id: data.ownerId } });
      if (!series) {
        throw new NotFoundException('Series not found');
      }
    }

    // Check if item already exists in collection based on type
    let existingItem;
    const itemData: any = { collectionId };
    
    if (data.ownerType === 'movie') {
      existingItem = await this.prisma.collectionItem.findUnique({
        where: { collectionId_movieId: { collectionId, movieId: data.ownerId } },
      });
      itemData.movieId = data.ownerId;
    } else if (data.ownerType === 'series') {
      existingItem = await this.prisma.collectionItem.findUnique({
        where: { collectionId_seriesId: { collectionId, seriesId: data.ownerId } },
      });
      itemData.seriesId = data.ownerId;
    }

    if (existingItem) {
      throw new BadRequestException('Item already exists in collection');
    }

    // Set order if not provided
    let order = data.order;
    if (order === undefined) {
      const lastItem = await this.prisma.collectionItem.findFirst({
        where: { collectionId },
        orderBy: { order: 'desc' },
      });
      order = (lastItem?.order || 0) + 1;
    }

    itemData.order = order;

    const item = await this.prisma.collectionItem.create({
      data: itemData,
    });

    return item;
  }

  async removeItem(collectionId: string, itemId: string) {
    const item = await this.prisma.collectionItem.findUnique({
      where: { id: itemId },
    });

    if (!item || item.collectionId !== collectionId) {
      throw new NotFoundException('Collection item not found');
    }

    await this.prisma.collectionItem.delete({ where: { id: itemId } });

    return { message: 'Item removed from collection' };
  }

  async reorderItems(collectionId: string, itemOrders: Array<{ id: string; order: number }>) {
    const collection = await this.prisma.collection.findUnique({
      where: { id: collectionId },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    // Update all items in a transaction
    await this.prisma.$transaction(
      itemOrders.map(({ id, order }) =>
        this.prisma.collectionItem.update({
          where: { id },
          data: { order },
        })
      )
    );

    return { message: 'Items reordered successfully' };
  }

  async duplicate(id: string, name: string) {
    const originalCollection = await this.prisma.collection.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!originalCollection) {
      throw new NotFoundException('Collection not found');
    }

    // Create new collection
    const newCollection = await this.prisma.collection.create({
      data: {
        name,
        description: `Copy of ${originalCollection.name}`,
      },
    });

    // Copy items
    if (originalCollection.items.length > 0) {
      await this.prisma.collectionItem.createMany({
        data: originalCollection.items.map(item => ({
          collectionId: newCollection.id,
          movieId: item.movieId,
          seriesId: item.seriesId,
          order: item.order,
        })),
      });
    }

    return this.findOne(newCollection.id);
  }

  async getStats() {
    const [
      totalCollections,
      emptyCollections,
      largestCollection,
      avgItemsPerCollection,
      mostUsedContent,
    ] = await Promise.all([
      this.prisma.collection.count(),

      this.prisma.collection.count({
        where: {
          items: { none: {} },
        },
      }),

      this.prisma.collection.findFirst({
        include: {
          _count: { select: { items: true } },
        },
        orderBy: {
          items: { _count: 'desc' },
        },
      }),

      this.prisma.collectionItem.aggregate({
        _avg: { order: true },
      }),

      // Get most popular items (movies and series separately)
      Promise.all([
        this.prisma.collectionItem.groupBy({
          by: ['movieId'],
          where: { movieId: { not: null } },
          _count: true,
          orderBy: { _count: { movieId: 'desc' } },
          take: 5,
        }),
        this.prisma.collectionItem.groupBy({
          by: ['seriesId'],
          where: { seriesId: { not: null } },
          _count: true,
          orderBy: { _count: { seriesId: 'desc' } },
          take: 5,
        }),
      ]).then(([movieItems, seriesItems]) => [...movieItems, ...seriesItems]),
    ]);

    return {
      totalCollections,
      emptyCollections,
      largestCollection: {
        id: largestCollection?.id,
        name: largestCollection?.name,
        itemsCount: largestCollection?._count.items || 0,
      },
      avgItemsPerCollection: avgItemsPerCollection._avg.order || 0,
      mostUsedContent,
    };
  }
}
