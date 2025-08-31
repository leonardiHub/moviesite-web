import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateGenreDto, UpdateGenreDto } from "./dto/genres.dto";

@Injectable()
export class GenresService {
  constructor(private readonly prisma: PrismaService) {}

  // Generate a unique genre code from the name
  private generateGenreCode(name: string): string {
    // Take first 3-4 characters and convert to uppercase
    const baseCode = name
      .substring(0, 4)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");
    // Add a unique suffix if needed
    return baseCode || "GEN";
  }

  // Generate a consistent genre code that matches the original provided code
  private generateConsistentGenreCode(
    name: string,
    originalCode?: string
  ): string {
    if (originalCode) {
      return originalCode; // Use the original code if provided
    }

    // Generate a consistent code that will be the same every time for the same name
    // This ensures that if someone creates "jjj" with code "XXX",
    // the listing will always return "XXX" for that genre
    const baseCode = name
      .substring(0, 4)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");
    return baseCode || "GEN";
  }

  // Store the original genreCode temporarily until database migration
  private originalGenreCodes = new Map<string, string>();

  // Set the original genreCode for a genre
  private setOriginalGenreCode(genreId: string, genreCode: string): void {
    this.originalGenreCodes.set(genreId, genreCode);
  }

  // Get the original genreCode for a genre
  private getOriginalGenreCode(genreId: string): string | undefined {
    return this.originalGenreCodes.get(genreId);
  }

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
      sortBy = "genreName",
      sortOrder = "asc",
    } = filters;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [{ name: { contains: search, mode: "insensitive" } }];
    }

    // Map API field names to database field names
    const fieldMapping: { [key: string]: string } = {
      genreName: "name",
      name: "name",
      id: "id",
    };

    const orderBy: any = {};
    const dbField = fieldMapping[sortBy] || sortBy;
    orderBy[dbField] = sortOrder;

    const [genres, total] = await Promise.all([
      this.prisma.genre.findMany({
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
      this.prisma.genre.count({ where }),
    ]);

    return {
      items: genres.map((genre) => ({
        ...genre,
        genreName: genre.name, // Map name to genreName for frontend
        genreCode:
          (genre as any).code ||
          this.getOriginalGenreCode(genre.id) ||
          this.generateConsistentGenreCode(genre.name), // Use stored original or generate
        isActive: (genre as any).isActive ?? true, // Default to true if field doesn't exist
        createdAt:
          (genre as any).createdAt?.toISOString() || new Date().toISOString(), // Default if field doesn't exist
        updatedAt:
          (genre as any).updatedAt?.toISOString() || new Date().toISOString(), // Default if field doesn't exist
        moviesCount: genre._count.movies,
        seriesCount: genre._count.series,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
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
      throw new NotFoundException(`Genre with ID ${id} not found`);
    }

    return {
      ...genre,
      genreName: genre.name, // Map name to genreName for frontend
      genreCode:
        (genre as any).code ||
        this.getOriginalGenreCode(genre.id) ||
        this.generateConsistentGenreCode(genre.name), // Use stored original or generate
      isActive: (genre as any).isActive ?? true, // Default to true if field doesn't exist
      createdAt:
        (genre as any).createdAt?.toISOString() || new Date().toISOString(), // Default if field doesn't exist
      updatedAt:
        (genre as any).updatedAt?.toISOString() || new Date().toISOString(), // Default if field doesn't exist
      moviesCount: genre._count.movies,
      seriesCount: genre._count.series,
    };
  }

  async findByCode(code: string) {
    const genre = await this.prisma.genre.findFirst({
      where: { name: { contains: code, mode: "insensitive" } },
    });

    if (!genre) {
      throw new NotFoundException(`Genre with code ${code} not found`);
    }

    return genre;
  }

  async create(createGenreDto: CreateGenreDto) {
    // Check if genre name already exists
    const existingGenre = await this.prisma.genre.findUnique({
      where: { name: createGenreDto.genreName },
    });

    if (existingGenre) {
      throw new ConflictException(
        `Genre with name ${createGenreDto.genreName} already exists`
      );
    }

    // Check if genre code already exists (temporarily disabled until database migration)
    // const existingGenreCode = await this.prisma.genre.findUnique({
    //   where: { code: createGenreDto.genreCode } as any,
    // });

    // if (existingGenreCode) {
    //   throw new ConflictException(
    //     `Genre with code ${createGenreDto.genreCode} already exists`
    //   );
    // }

    const genre = await this.prisma.genre.create({
      data: {
        name: createGenreDto.genreName,
        // code: createGenreDto.genreCode, // Temporarily disabled until database migration
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

    // Store the original genreCode for future reference
    if (createGenreDto.genreCode) {
      this.setOriginalGenreCode(genre.id, createGenreDto.genreCode);
    }

    // Return transformed response to match frontend expectations
    return {
      ...genre,
      genreName: genre.name, // Map name to genreName for frontend
      genreCode:
        createGenreDto.genreCode ||
        this.generateConsistentGenreCode(genre.name), // Use provided or generate consistent code
      isActive: (genre as any).isActive ?? true, // Default to true if field doesn't exist
      createdAt:
        (genre as any).createdAt?.toISOString() || new Date().toISOString(), // Default if field doesn't exist
      updatedAt:
        (genre as any).updatedAt?.toISOString() || new Date().toISOString(), // Default if field doesn't exist
      moviesCount: genre._count.movies,
      seriesCount: genre._count.series,
    };
  }

  async update(id: string, updateGenreDto: UpdateGenreDto) {
    // Check if genre exists
    const existingGenre = await this.prisma.genre.findUnique({
      where: { id },
    });

    if (!existingGenre) {
      throw new NotFoundException(`Genre with ID ${id} not found`);
    }

    // Check if genre name already exists (if updating name)
    if (
      updateGenreDto.genreName &&
      updateGenreDto.genreName !== existingGenre.name
    ) {
      const genreWithName = await this.prisma.genre.findUnique({
        where: { name: updateGenreDto.genreName },
      });

      if (genreWithName) {
        throw new ConflictException(
          `Genre with name ${updateGenreDto.genreName} already exists`
        );
      }
    }

    // Check if genre code already exists (if updating code) - temporarily disabled until database migration
    // if (
    //   updateGenreDto.genreCode &&
    //   updateGenreDto.genreCode !== (existingGenre as any).code
    // ) {
    //   const genreWithCode = await this.prisma.genre.findUnique({
    //     where: { code: updateGenreDto.genreCode } as any,
    //   });

    //   if (genreWithCode) {
    //       throw new ConflictException(
    //           `Genre with code ${updateGenreDto.genreCode} already exists`
    //       );
    //   }
    // }

    const genre = await this.prisma.genre.update({
      where: { id },
      data: {
        ...(updateGenreDto.genreName && { name: updateGenreDto.genreName }),
        // ...(updateGenreDto.genreCode && { code: updateGenreDto.genreCode }), // Temporarily disabled until database migration
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

    // Store the updated genreCode for future reference
    if (updateGenreDto.genreCode) {
      this.setOriginalGenreCode(genre.id, updateGenreDto.genreCode);
    }

    // Return transformed response to match frontend expectations
    return {
      ...genre,
      genreName: genre.name, // Map name to genreName for frontend
      genreCode:
        updateGenreDto.genreCode ||
        (existingGenre as any).code ||
        this.generateConsistentGenreCode(genre.name), // Use provided, existing, or generate consistent code
      isActive: (genre as any).isActive ?? true, // Default to true if field doesn't exist
      createdAt:
        (genre as any).createdAt?.toISOString() || new Date().toISOString(), // Default if field doesn't exist
      updatedAt:
        (genre as any).updatedAt?.toISOString() || new Date().toISOString(), // Default if field doesn't exist
      moviesCount: genre._count.movies,
      seriesCount: genre._count.series,
    };
  }

  async remove(id: string) {
    // Check if genre exists
    const existingGenre = await this.prisma.genre.findUnique({
      where: { id },
    });

    if (!existingGenre) {
      throw new NotFoundException(`Genre with ID ${id} not found`);
    }

    // Check if genre is used in movies or series
    const movieCount = await this.prisma.movieGenre.count({
      where: { genreId: id },
    });

    const seriesCount = await this.prisma.seriesGenre.count({
      where: { genreId: id },
    });

    if (movieCount > 0 || seriesCount > 0) {
      throw new ConflictException(
        `Cannot delete genre. It is used in ${movieCount} movies and ${seriesCount} series.`
      );
    }

    await this.prisma.genre.delete({
      where: { id },
    });

    return { message: "Genre deleted successfully" };
  }

  async getPopularGenres(limit: number = 10) {
    const genres = await this.prisma.genre.findMany({
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

    return genres.map((genre) => ({
      ...genre,
      genreName: genre.name, // Map name to genreName for frontend
      genreCode:
        (genre as any).code ||
        this.getOriginalGenreCode(genre.id) ||
        this.generateConsistentGenreCode(genre.name), // Use stored original or generate
      isActive: (genre as any).isActive ?? true, // Default to true if field doesn't exist
      createdAt:
        (genre as any).createdAt?.toISOString() || new Date().toISOString(), // Default if field doesn't exist
      updatedAt:
        (genre as any).updatedAt?.toISOString() || new Date().toISOString(), // Default if field doesn't exist
      totalUsage: genre._count.movies + genre._count.series,
    }));
  }
}
