import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCountryDto, UpdateCountryDto } from "./dto/countries.dto";

@Injectable()
export class CountriesService {
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
      sortBy = "name",
      sortOrder = "asc",
    } = filters;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
        { nativeName: { contains: search, mode: "insensitive" } },
      ];
    }

    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [countries, total] = await Promise.all([
      this.prisma.country.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              movies: true,
            },
          },
        },
      }),
      this.prisma.country.count({ where }),
    ]);

    return {
      items: countries.map((country) => ({
        ...country,
        moviesCount: country._count.movies,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const country = await this.prisma.country.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            movies: true,
          },
        },
      },
    });

    if (!country) {
      throw new NotFoundException(`Country with ID ${id} not found`);
    }

    return {
      ...country,
      moviesCount: country._count.movies,
    };
  }

  async findByCode(code: string) {
    const country = await this.prisma.country.findUnique({
      where: { code },
    });

    if (!country) {
      throw new NotFoundException(`Country with code ${code} not found`);
    }

    return country;
  }

  async create(createCountryDto: CreateCountryDto) {
    // Check if country with same code already exists
    const existingCountry = await this.prisma.country.findUnique({
      where: { code: createCountryDto.code },
    });

    if (existingCountry) {
      throw new ConflictException(
        `Country with code ${createCountryDto.code} already exists`
      );
    }

    const country = await this.prisma.country.create({
      data: createCountryDto,
    });

    return country;
  }

  async update(id: string, updateCountryDto: UpdateCountryDto) {
    // Check if country exists
    const existingCountry = await this.prisma.country.findUnique({
      where: { id },
    });

    if (!existingCountry) {
      throw new NotFoundException(`Country with ID ${id} not found`);
    }

    // If updating code, check for conflicts
    if (
      updateCountryDto.code &&
      updateCountryDto.code !== existingCountry.code
    ) {
      const codeConflict = await this.prisma.country.findUnique({
        where: { code: updateCountryDto.code },
      });

      if (codeConflict) {
        throw new ConflictException(
          `Country with code ${updateCountryDto.code} already exists`
        );
      }
    }

    const country = await this.prisma.country.update({
      where: { id },
      data: updateCountryDto,
    });

    return country;
  }

  async remove(id: string) {
    // Check if country exists
    const existingCountry = await this.prisma.country.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            movies: true,
          },
        },
      },
    });

    if (!existingCountry) {
      throw new NotFoundException(`Country with ID ${id} not found`);
    }

    // Check if country is used in movies
    if (existingCountry._count.movies > 0) {
      throw new ConflictException(
        `Cannot delete country. It is used in ${existingCountry._count.movies} movie(s).`
      );
    }

    await this.prisma.country.delete({
      where: { id },
    });

    return { message: "Country deleted successfully" };
  }

  async getPopularCountries(limit: number = 10) {
    const countries = await this.prisma.country.findMany({
      include: {
        _count: {
          select: {
            movies: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
      take: limit,
    });

    return countries.map((country) => ({
      ...country,
      moviesCount: country._count.movies,
    }));
  }
}
