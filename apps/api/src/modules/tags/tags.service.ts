import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTagDto, UpdateTagDto } from "./dto/tags.dto";

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: {
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    const {
      search,
      page = 1,
      limit = 20,
      sortBy = "tagName",
      sortOrder = "asc",
    } = filters;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [{ name: { contains: search, mode: "insensitive" } }];
    }

    // Map API field names to database field names
    const fieldMapping: { [key: string]: string } = {
      tagName: "name",
      name: "name",
      id: "id",
    };

    const orderBy: any = {};
    const dbField = fieldMapping[sortBy] || sortBy;
    orderBy[dbField] = sortOrder;

    const [tags, total] = await Promise.all([
      this.prisma.tag.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              movies: true,
              series: true,
            },
          },
        },
      }),
      this.prisma.tag.count({ where }),
    ]);

    return {
      items: tags.map((tag) => ({
        ...tag,
        tagName: tag.name, // Map name to tagName for frontend
        tagCode: tag.code, // Use actual code field from database
        moviesCount: tag._count.movies,
        seriesCount: tag._count.series,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
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
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }

    return {
      ...tag,
      tagName: tag.name, // Map name to tagName for frontend
      tagCode: tag.code, // Use actual code field from database
      moviesCount: tag._count.movies,
      seriesCount: tag._count.series,
    };
  }

  async findByCode(code: string) {
    const tag = await this.prisma.tag.findFirst({
      where: { name: { contains: code, mode: "insensitive" } },
    });

    if (!tag) {
      throw new NotFoundException(`Tag with code ${code} not found`);
    }

    return tag;
  }

  async create(createTagDto: CreateTagDto) {
    // Check if tag name already exists
    const existingTag = await this.prisma.tag.findUnique({
      where: { name: createTagDto.tagName },
    });

    if (existingTag) {
      throw new ConflictException(
        `Tag with name ${createTagDto.tagName} already exists`
      );
    }

    // Check if tag code already exists
    const existingTagCode = await this.prisma.tag.findUnique({
      where: { code: createTagDto.tagCode },
    });

    if (existingTagCode) {
      throw new ConflictException(
        `Tag with code ${createTagDto.tagCode} already exists`
      );
    }

    const tag = await this.prisma.tag.create({
      data: {
        name: createTagDto.tagName,
        code: createTagDto.tagCode,
      },
      include: {
        _count: {
          select: {
            movies: true,
            series: true,
          },
        },
      },
    });

    // Return transformed response to match frontend expectations
    return {
      ...tag,
      tagName: tag.name, // Map name to tagName for frontend
      tagCode: tag.code, // Use actual code field from database
      moviesCount: tag._count.movies,
      seriesCount: tag._count.series,
    };
  }

  async update(id: string, updateTagDto: UpdateTagDto) {
    // Check if tag exists
    const existingTag = await this.prisma.tag.findUnique({
      where: { id },
    });

    if (!existingTag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }

    // Check if tag name already exists (if updating name)
    if (updateTagDto.tagName && updateTagDto.tagName !== existingTag.name) {
      const tagWithName = await this.prisma.tag.findUnique({
        where: { name: updateTagDto.tagName },
      });

      if (tagWithName) {
        throw new ConflictException(
          `Tag with name ${updateTagDto.tagName} already exists`
        );
      }
    }

    // Check if tag code already exists (if updating code)
    if (updateTagDto.tagCode && updateTagDto.tagCode !== existingTag.code) {
      const tagWithCode = await this.prisma.tag.findUnique({
        where: { code: updateTagDto.tagCode },
      });

      if (tagWithCode) {
        throw new ConflictException(
          `Tag with code ${updateTagDto.tagCode} already exists`
        );
      }
    }

    const tag = await this.prisma.tag.update({
      where: { id },
      data: {
        ...(updateTagDto.tagName && { name: updateTagDto.tagName }),
        ...(updateTagDto.tagCode && { code: updateTagDto.tagCode }),
      },
      include: {
        _count: {
          select: {
            movies: true,
            series: true,
          },
        },
      },
    });

    // Return transformed response to match frontend expectations
    return {
      ...tag,
      tagName: tag.name, // Map name to tagName for frontend
      tagCode: tag.code, // Use actual code field from database
      moviesCount: tag._count.movies,
      seriesCount: tag._count.series,
    };
  }

  async remove(id: string) {
    // Check if tag exists
    const existingTag = await this.prisma.tag.findUnique({
      where: { id },
    });

    if (!existingTag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }

    // Check if tag is used in movies or series
    const movieCount = await this.prisma.movieTag.count({
      where: { tagId: id },
    });

    const seriesCount = await this.prisma.seriesTag.count({
      where: { tagId: id },
    });

    if (movieCount > 0 || seriesCount > 0) {
      throw new ConflictException(
        `Cannot delete tag. It is used in ${movieCount} movies and ${seriesCount} series.`
      );
    }

    await this.prisma.tag.delete({
      where: { id },
    });

    return { message: "Tag deleted successfully" };
  }

  async getPopularTags(limit: number = 10) {
    const tags = await this.prisma.tag.findMany({
      take: limit,
      include: {
        _count: {
          select: {
            movies: true,
            series: true,
          },
        },
      },
      orderBy: {
        movies: {
          _count: "desc",
        },
      },
    });

    return tags.map((tag) => ({
      ...tag,
      totalUsage: tag._count.movies + tag._count.series,
    }));
  }
}
