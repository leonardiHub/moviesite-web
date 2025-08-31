import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { StorageService } from "../storage/storage.service";
import { ConfigService } from "@nestjs/config";
import { CreateCastDto, UpdateCastDto } from "./dto/cast.dto";

@Injectable()
export class CastService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly configService: ConfigService
  ) {}

  // Temporary storage for cast descriptions until database migration is complete
  private castDescriptions = new Map<string, string>();

  // Generate image URL in the same format as movie service
  private generateImageUrl(
    s3Key: string | null | undefined
  ): string | undefined {
    if (!s3Key) return undefined;

    const baseUrl = this.configService.get(
      "PUBLIC_BASE_URL",
      "http://localhost:4000"
    );
    return `${baseUrl}/v1/images/${encodeURIComponent(s3Key)}`;
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
      sortBy = "castName",
      sortOrder = "asc",
    } = filters;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [{ name: { contains: search, mode: "insensitive" } }];
    }

    // Map API field names to database field names
    const fieldMapping: { [key: string]: string } = {
      castName: "name",
      name: "name",
      id: "id",
    };

    const orderBy: any = {};
    const dbField = fieldMapping[sortBy] || sortBy;
    orderBy[dbField] = sortOrder;

    const [castMembers, total] = await Promise.all([
      this.prisma.person.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              credits: true,
            },
          },
        },
      }),
      this.prisma.person.count({ where }),
    ]);

    return {
      items: castMembers.map((person) => ({
        ...person,
        castName: person.name, // Map name to castName for frontend
        castImage: this.generateImageUrl(person.avatar), // Map avatar to castImage for frontend with full URL
        castDescription: this.castDescriptions.get(person.id) || "", // Use stored description
        isActive: (person as any).isActive ?? true, // Default to true if field doesn't exist
        createdAt:
          (person as any).createdAt?.toISOString() || new Date().toISOString(), // Default if field doesn't exist
        updatedAt:
          (person as any).updatedAt?.toISOString() || new Date().toISOString(), // Default if field doesn't exist
        moviesCount: person._count.credits,
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
        _count: {
          select: {
            credits: true,
          },
        },
        credits: {
          include: {
            movie: {
              select: {
                id: true,
                title: true,
                year: true,
              },
            },
            episode: {
              select: {
                id: true,
                title: true,
                season: {
                  select: {
                    series: {
                      select: {
                        id: true,
                        title: true,
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
              },
            },
          },
        },
      },
    });

    if (!person) {
      throw new NotFoundException(`Cast member with ID ${id} not found`);
    }

    return {
      ...person,
      castName: person.name, // Map name to castName for frontend
      castImage: this.generateImageUrl(person.avatar), // Map avatar to castImage for frontend with full URL
      castDescription: this.castDescriptions.get(person.id) || "", // Use stored description
      isActive: (person as any).isActive ?? true, // Default to true if field doesn't exist
      createdAt:
        (person as any).createdAt?.toISOString() || new Date().toISOString(), // Default if field doesn't exist
      updatedAt:
        (person as any).updatedAt?.toISOString() || new Date().toISOString(), // Default if field doesn't exist
      moviesCount: person._count.credits,
    };
  }

  async findByName(name: string) {
    const person = await this.prisma.person.findFirst({
      where: { name },
    });

    if (!person) {
      throw new NotFoundException(`Cast member with name ${name} not found`);
    }

    return person;
  }

  async create(createCastDto: CreateCastDto) {
    // Check if cast member name already exists
    const existingPerson = await this.prisma.person.findFirst({
      where: { name: createCastDto.castName },
    });

    if (existingPerson) {
      throw new ConflictException(
        `Cast member with name ${createCastDto.castName} already exists`
      );
    }

    let avatarUrl = createCastDto.castImage;

    // Handle file upload if provided
    if (createCastDto.castImageFile) {
      try {
        // Generate S3 path for cast image
        const key = this.storage.generatePath(
          "avatar",
          createCastDto.castImageFile.originalname
        );

        // Upload to S3
        await this.storage.uploadFile(
          key,
          createCastDto.castImageFile.buffer,
          createCastDto.castImageFile.mimetype
        );

        // Create artwork record for cast image
        await this.prisma.artwork.create({
          data: {
            kind: "avatar",
            url: key,
            width: undefined, // Could extract from image metadata
            height: undefined,
          },
        });

        avatarUrl = key;
      } catch (error) {
        console.error("Failed to upload cast image:", error);
        throw new Error("Failed to upload cast image");
      }
    }

    const person = await this.prisma.person.create({
      data: {
        name: createCastDto.castName,
        ...(avatarUrl && { avatar: avatarUrl }),
        // Note: description field will be added after database migration
        // ...(createCastDto.castDescription && {
        //   description: createCastDto.castDescription,
        // }),
      },
    });

    // Store description temporarily until database migration is complete
    if (createCastDto.castDescription) {
      this.castDescriptions.set(person.id, createCastDto.castDescription);
    }

    // Return transformed response to match frontend expectations
    return {
      ...person,
      castName: person.name, // Map name to castName for frontend
      castImage: this.generateImageUrl(person.avatar), // Map avatar to castImage for frontend with full URL
      castDescription: createCastDto.castDescription || "", // Use the provided description
      isActive: (person as any).isActive ?? true, // Default to true if field doesn't exist
      createdAt:
        (person as any).createdAt?.toISOString() || new Date().toISOString(), // Default if field doesn't exist
      updatedAt:
        (person as any).updatedAt?.toISOString() || new Date().toISOString(), // Default if field doesn't exist
      moviesCount: 0, // New cast member has no credits yet
    };
  }

  async update(id: string, updateCastDto: UpdateCastDto) {
    // Check if cast member exists
    const existingPerson = await this.prisma.person.findUnique({
      where: { id },
    });

    if (!existingPerson) {
      throw new NotFoundException(`Cast member with ID ${id} not found`);
    }

    // Check if cast member name already exists (if updating name)
    if (
      updateCastDto.castName &&
      updateCastDto.castName !== existingPerson.name
    ) {
      const personWithName = await this.prisma.person.findFirst({
        where: { name: updateCastDto.castName },
      });

      if (personWithName) {
        throw new ConflictException(
          `Cast member with name ${updateCastDto.castName} already exists`
        );
      }
    }

    let avatarUrl = updateCastDto.castImage;

    // Handle file upload if provided
    if (updateCastDto.castImageFile) {
      try {
        // Delete old image if it exists
        if (existingPerson.avatar) {
          try {
            await this.storage.deleteFile(existingPerson.avatar);
          } catch (error) {
            console.error("Failed to delete old cast image:", error);
          }
        }

        // Generate S3 path for new cast image
        const key = this.storage.generatePath(
          "avatar",
          updateCastDto.castImageFile.originalname
        );

        // Upload to S3
        await this.storage.uploadFile(
          key,
          updateCastDto.castImageFile.buffer,
          updateCastDto.castImageFile.mimetype
        );

        // Create or update artwork record for cast image
        const existingArtwork = existingPerson.avatar
          ? await this.prisma.artwork.findFirst({
              where: { url: existingPerson.avatar },
            })
          : null;

        if (existingArtwork) {
          // Update existing artwork
          await this.prisma.artwork.update({
            where: { id: existingArtwork.id },
            data: { url: key },
          });
        } else {
          // Create new artwork record
          await this.prisma.artwork.create({
            data: {
              kind: "avatar",
              url: key,
              width: undefined,
              height: undefined,
            },
          });
        }

        avatarUrl = key;
      } catch (error) {
        console.error("Failed to upload cast image:", error);
        throw new Error("Failed to upload cast image");
      }
    }

    const person = await this.prisma.person.update({
      where: { id },
      data: {
        ...(updateCastDto.castName && { name: updateCastDto.castName }),
        ...(avatarUrl && { avatar: avatarUrl }),
        // Note: description field will be added after database migration
        // ...(updateCastDto.castDescription && {
        //   description: updateCastDto.castDescription,
        // }),
      },
    });

    // Update description temporarily until database migration is complete
    if (updateCastDto.castDescription !== undefined) {
      this.castDescriptions.set(person.id, updateCastDto.castDescription);
    }

    // Return transformed response to match frontend expectations
    return {
      ...person,
      castName: person.name, // Map name to castName for frontend
      castImage: this.generateImageUrl(person.avatar), // Map avatar to castImage for frontend with full URL
      castDescription:
        updateCastDto.castDescription !== undefined
          ? updateCastDto.castDescription
          : this.castDescriptions.get(person.id) || "", // Use provided or stored description
      isActive: (person as any).isActive ?? true, // Default to true if field doesn't exist
      createdAt:
        (person as any).createdAt?.toISOString() || new Date().toISOString(), // Default if field doesn't exist
      updatedAt:
        (person as any).updatedAt?.toISOString() || new Date().toISOString(), // Default if field doesn't exist
      moviesCount: 0, // Will be updated when fetched from listing
    };
  }

  async remove(id: string) {
    // Check if cast member exists
    const existingPerson = await this.prisma.person.findUnique({
      where: { id },
    });

    if (!existingPerson) {
      throw new NotFoundException(`Cast member with ID ${id} not found`);
    }

    // Check if cast member is used in credits
    const creditCount = await this.prisma.credit.count({
      where: { personId: id },
    });

    if (creditCount > 0) {
      throw new ConflictException(
        `Cannot delete cast member. They are credited in ${creditCount} movies/series.`
      );
    }

    await this.prisma.person.delete({
      where: { id },
    });

    return { message: "Cast member deleted successfully" };
  }

  async getPopularCast(limit: number = 10) {
    const castMembers = await this.prisma.person.findMany({
      take: limit,
      include: {
        _count: {
          select: {
            credits: true,
          },
        },
      },
      orderBy: {
        credits: {
          _count: "desc",
        },
      },
    });

    return castMembers.map((person) => ({
      ...person,
      castName: person.name, // Map name to castName for frontend
      castImage: this.generateImageUrl(person.avatar), // Map avatar to castImage for frontend with full URL
      castDescription: this.castDescriptions.get(person.id) || "", // Use stored description
      isActive: (person as any).isActive ?? true, // Default to true if field doesn't exist
      createdAt:
        (person as any).createdAt?.toISOString() || new Date().toISOString(), // Default if field doesn't exist
      updatedAt:
        (person as any).updatedAt?.toISOString() || new Date().toISOString(), // Default if field doesn't exist
      totalCredits: person._count.credits,
    }));
  }
}
