import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import {
  FileInterceptor,
  FilesInterceptor,
  FileFieldsInterceptor,
} from "@nestjs/platform-express";
import { validate, ValidationError } from "class-validator";
import { plainToClass } from "class-transformer";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from "@nestjs/swagger";

import { MovieService } from "../content/movie.service";
import { RbacGuard, RequirePermissions } from "../auth/guards/rbac.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { AuditService } from "../auth/audit.service";
import { PERMISSIONS } from "../../constants/permissions";
import {
  CreateMovieDto,
  UpdateMovieDto,
  MovieResponseDto,
  MovieListResponseDto,
  MovieStatus,
  MovieWithPosterDto,
} from "../content/dto/movie.dto";
import {
  CreateArtworkDto,
  ArtworkResponseDto,
  UploadArtworkResponseDto,
  ArtworkKind,
} from "../content/dto/artwork.dto";

@ApiTags("Admin - Movie Management")
@Controller("admin/movies")
@UseGuards(AuthGuard("jwt"), RbacGuard)
@ApiBearerAuth()
export class AdminMoviesController {
  constructor(
    private movieService: MovieService,
    private auditService: AuditService
  ) {}

  @Get()
  @RequirePermissions(PERMISSIONS.CONTENT_MOVIES_VIEW)
  @ApiOperation({
    summary: "Get all movies with pagination and filters (Admin)",
    description: `
      Supports filtering by:
      - Single values: genreId, tagId, castId, countryId
      - Multiple values (comma-separated): genres, tags, casts, countries
      - Text search: search
      - Status: status
      - Year: year
      - Pagination: page, limit
      - Sorting: sortBy, sortOrder
      
      Examples:
      - /admin/movies?genres=id1,id2,id3
      - /admin/movies?tags=tag1,tag2&casts=cast1,cast2
      - /admin/movies?countries=country1&status=published
    `,
  })
  @ApiResponse({
    status: 200,
    description: "Movies retrieved successfully",
    type: MovieListResponseDto,
  })
  async getMovies(
    @Query("search") search?: string,
    @Query("status") status?: MovieStatus,
    @Query("genreId") genreId?: string,
    @Query("tagId") tagId?: string,
    @Query("castId") castId?: string,
    @Query("countryId") countryId?: string,
    @Query("genres") genres?: string, // Comma-separated genre IDs
    @Query("tags") tags?: string, // Comma-separated tag IDs
    @Query("casts") casts?: string, // Comma-separated cast IDs
    @Query("countries") countries?: string, // Comma-separated country IDs
    @Query("year", new DefaultValuePipe(undefined)) year?: number,
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query("limit", new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
    @Query("sortBy", new DefaultValuePipe("updatedAt"))
    sortBy: string = "updatedAt",
    @Query("sortOrder", new DefaultValuePipe("desc"))
    sortOrder: "asc" | "desc" = "desc"
  ) {
    // Parse comma-separated values
    const genreIds = genres ? genres.split(",").filter((id) => id.trim()) : [];
    const tagIds = tags ? tags.split(",").filter((id) => id.trim()) : [];
    const castIds = casts ? casts.split(",").filter((id) => id.trim()) : [];
    const countryIds = countries
      ? countries.split(",").filter((id) => id.trim())
      : [];

    return this.movieService.findAll({
      search,
      status,
      genreId,
      tagId,
      castId,
      countryId,
      genreIds,
      tagIds,
      castIds,
      countryIds,
      year,
      page,
      limit,
      sortBy,
      sortOrder,
    });
  }

  @Get("stats")
  @RequirePermissions(PERMISSIONS.CONTENT_MOVIES_VIEW)
  @ApiOperation({ summary: "Get movie statistics (Admin)" })
  async getMovieStats() {
    return this.movieService.getStats();
  }

  @Get(":id")
  @RequirePermissions(PERMISSIONS.CONTENT_MOVIES_VIEW)
  @ApiOperation({ summary: "Get movie by ID (Admin)" })
  @ApiResponse({
    status: 200,
    description: "Movie retrieved successfully",
    type: MovieResponseDto,
  })
  async getMovie(@Param("id") id: string) {
    return this.movieService.findOne(id);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.CONTENT_MOVIES_CREATE)
  @ApiOperation({
    summary: "Create a new movie with optional poster and video (Admin)",
  })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: "poster", maxCount: 1 },
      { name: "videoFile", maxCount: 1 },
    ])
  )
  @ApiResponse({
    status: 201,
    description: "Movie created successfully",
    type: MovieResponseDto,
  })
  async createMovie(
    @Body() body: any,
    @UploadedFiles()
    files: {
      poster?: Express.Multer.File[];
      videoFile?: Express.Multer.File[];
    },
    @CurrentUser("userId") userId?: string
  ) {
    // Parse the movie data from JSON if it comes from FormData
    let createMovieDto: CreateMovieDto;
    if (body.movieData) {
      // Data comes as JSON string from FormData
      try {
        const parsedData = JSON.parse(body.movieData);
        createMovieDto = plainToClass(CreateMovieDto, parsedData);

        // Manually validate the DTO
        const errors = await validate(createMovieDto);
        if (errors.length > 0) {
          const errorMessages = errors
            .map((error: ValidationError) =>
              Object.values(error.constraints || {}).join(", ")
            )
            .join("; ");
          throw new BadRequestException(`Validation failed: ${errorMessages}`);
        }
      } catch (error) {
        if (error instanceof BadRequestException) {
          throw error;
        }
        throw new BadRequestException("Invalid movie data format");
      }
    } else {
      // Data comes as regular JSON body
      createMovieDto = body;
    }

    // If files are provided, add them to the DTO
    if (files?.poster && files.poster[0]) {
      createMovieDto.posterFile = files.poster[0];
    }

    // Video file is required
    if (!files?.videoFile || !files.videoFile[0]) {
      throw new BadRequestException(
        "Video file is required for movie creation"
      );
    }
    createMovieDto.videoFile = files.videoFile[0];

    const result = await this.movieService.create(createMovieDto);

    await this.auditService.log({
      adminUserId: userId,
      action: "create_movie",
      targetType: "Movie",
      targetId: result.id,
      diffJson: {
        title: result.title,
        hasPoster: !!(files?.poster && files.poster[0]),
        hasVideo: !!(files?.videoFile && files.videoFile[0]),
      },
    });

    return result;
  }

  @Put(":id")
  @RequirePermissions(PERMISSIONS.CONTENT_MOVIES_UPDATE)
  @ApiOperation({
    summary: "Update an existing movie with optional poster and video (Admin)",
  })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: "poster", maxCount: 1 },
      { name: "videoFile", maxCount: 1 },
    ])
  )
  @ApiResponse({
    status: 200,
    description: "Movie updated successfully",
    type: MovieResponseDto,
  })
  async updateMovie(
    @Param("id") id: string,
    @Body() body: any,
    @UploadedFiles()
    files: {
      poster?: Express.Multer.File[];
      videoFile?: Express.Multer.File[];
    },
    @CurrentUser("userId") userId?: string
  ) {
    // Parse the movie data from JSON if it comes from FormData
    let updateMovieDto: UpdateMovieDto;
    if (body.movieData) {
      // Data comes as JSON string from FormData
      try {
        const parsedData = JSON.parse(body.movieData);
        updateMovieDto = plainToClass(UpdateMovieDto, parsedData);

        // Manually validate the DTO
        const errors = await validate(updateMovieDto);
        if (errors.length > 0) {
          const errorMessages = errors
            .map((error: ValidationError) =>
              Object.values(error.constraints || {}).join(", ")
            )
            .join("; ");
          throw new BadRequestException(`Validation failed: ${errorMessages}`);
        }
      } catch (error) {
        if (error instanceof BadRequestException) {
          throw error;
        }
        throw new BadRequestException("Invalid movie data format");
      }
    } else {
      // Data comes as regular JSON body
      updateMovieDto = body;
    }

    // If files are provided, add them to the DTO
    if (files?.poster && files.poster[0]) {
      updateMovieDto.posterFile = files.poster[0];
    }
    if (files?.videoFile && files.videoFile[0]) {
      updateMovieDto.videoFile = files.videoFile[0];
    }

    const result = await this.movieService.update(id, updateMovieDto);

    await this.auditService.log({
      adminUserId: userId,
      action: "update_movie",
      targetType: "Movie",
      targetId: id,
      diffJson: {
        ...updateMovieDto,
        hasPoster: !!(files?.poster && files.poster[0]),
        hasVideo: !!(files?.videoFile && files.videoFile[0]),
      },
    });

    return result;
  }

  @Delete(":id")
  @RequirePermissions(PERMISSIONS.CONTENT_MOVIES_DELETE)
  @ApiOperation({ summary: "Delete a movie (Admin)" })
  @ApiResponse({ status: 200, description: "Movie deleted successfully" })
  async deleteMovie(
    @Param("id") id: string,
    @CurrentUser("userId") userId: string
  ) {
    const result = await this.movieService.delete(id);

    await this.auditService.log({
      adminUserId: userId,
      action: "delete_movie",
      targetType: "Movie",
      targetId: id,
    });

    return result;
  }

  // ==================== MOVIE POSTER MANAGEMENT ====================
  @Post(":id/poster/upload")
  @RequirePermissions(PERMISSIONS.CONTENT_MOVIES_UPDATE)
  @ApiOperation({ summary: "Upload movie poster directly (Admin)" })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("poster"))
  @ApiResponse({
    status: 200,
    description: "Poster uploaded successfully",
    type: MovieResponseDto,
  })
  async uploadMoviePoster(
    @Param("id") movieId: string,
    @UploadedFile() posterFile: Express.Multer.File,
    @CurrentUser("userId") userId: string
  ) {
    const result = await this.movieService.uploadMoviePoster(
      movieId,
      posterFile
    );

    await this.auditService.log({
      adminUserId: userId,
      action: "upload_movie_poster",
      targetType: "Movie",
      targetId: movieId,
      diffJson: { posterFile: posterFile.originalname },
    });

    return result;
  }

  @Post(":id/poster/upload-url")
  @RequirePermissions(PERMISSIONS.CONTENT_MOVIES_UPDATE)
  @ApiOperation({ summary: "Generate poster upload URL for frontend (Admin)" })
  @ApiResponse({
    status: 200,
    description: "Upload URL generated successfully",
    type: MovieWithPosterDto,
  })
  async generatePosterUploadUrl(
    @Param("id") movieId: string,
    @Body() uploadData: { filename: string; contentType: string },
    @CurrentUser("userId") userId: string
  ) {
    const result = await this.movieService.generatePosterUploadUrl(
      movieId,
      uploadData.filename,
      uploadData.contentType
    );

    await this.auditService.log({
      adminUserId: userId,
      action: "generate_poster_upload_url",
      targetType: "Movie",
      targetId: movieId,
      diffJson: {
        filename: uploadData.filename,
        contentType: uploadData.contentType,
      },
    });

    return result;
  }

  @Put(":id/poster/url")
  @RequirePermissions(PERMISSIONS.CONTENT_MOVIES_UPDATE)
  @ApiOperation({ summary: "Update movie poster URL (Admin)" })
  @ApiResponse({
    status: 200,
    description: "Poster URL updated successfully",
    type: MovieResponseDto,
  })
  async updateMoviePosterUrl(
    @Param("id") movieId: string,
    @Body() posterData: { posterUrl: string },
    @CurrentUser("userId") userId: string
  ) {
    const result = await this.movieService.updateMoviePosterUrl(
      movieId,
      posterData.posterUrl
    );

    await this.auditService.log({
      adminUserId: userId,
      action: "update_movie_poster_url",
      targetType: "Movie",
      targetId: movieId,
      diffJson: { posterUrl: posterData.posterUrl },
    });

    return result;
  }

  @Delete(":id/poster")
  @RequirePermissions(PERMISSIONS.CONTENT_MOVIES_UPDATE)
  @ApiOperation({ summary: "Delete movie poster (Admin)" })
  @ApiResponse({ status: 200, description: "Poster deleted successfully" })
  async deleteMoviePoster(
    @Param("id") movieId: string,
    @CurrentUser("userId") userId: string
  ) {
    const result = await this.movieService.deleteMoviePoster(movieId);

    await this.auditService.log({
      adminUserId: userId,
      action: "delete_movie_poster",
      targetType: "Movie",
      targetId: movieId,
    });

    return result;
  }

  // ==================== MOVIE ARTWORKS ====================
  @Post(":id/artworks")
  @RequirePermissions(PERMISSIONS.CONTENT_MOVIES_UPDATE)
  @ApiOperation({ summary: "Create artwork record for movie (Admin)" })
  @ApiResponse({
    status: 201,
    description: "Artwork created successfully",
    type: ArtworkResponseDto,
  })
  async createMovieArtwork(
    @Param("id") movieId: string,
    @Body() createArtworkDto: CreateArtworkDto,
    @CurrentUser("userId") userId: string
  ) {
    const result = await this.movieService.createArtwork(
      movieId,
      createArtworkDto
    );

    await this.auditService.log({
      adminUserId: userId,
      action: "create_movie_artwork",
      targetType: "Artwork",
      targetId: result.id,
      diffJson: { movieId, kind: createArtworkDto.kind },
    });

    return result;
  }

  @Post(":id/artworks/:artworkId/upload")
  @RequirePermissions(PERMISSIONS.CONTENT_MOVIES_UPDATE)
  @ApiOperation({ summary: "Generate upload URL for movie artwork (Admin)" })
  @ApiResponse({
    status: 200,
    description: "Upload URL generated successfully",
    type: UploadArtworkResponseDto,
  })
  async generateArtworkUploadUrl(
    @Param("id") movieId: string,
    @Param("artworkId") artworkId: string,
    @Body() uploadData: { contentType: string; filename: string },
    @CurrentUser("userId") userId: string
  ) {
    const result = await this.movieService.generateArtworkUploadUrl(
      movieId,
      artworkId,
      uploadData
    );

    await this.auditService.log({
      adminUserId: userId,
      action: "generate_artwork_upload_url",
      targetType: "Artwork",
      targetId: artworkId,
      diffJson: { movieId, contentType: uploadData.contentType },
    });

    return result;
  }

  @Delete(":id/artworks/:artworkId")
  @RequirePermissions(PERMISSIONS.CONTENT_MOVIES_UPDATE)
  @ApiOperation({ summary: "Delete movie artwork (Admin)" })
  @ApiResponse({ status: 200, description: "Artwork deleted successfully" })
  async deleteMovieArtwork(
    @Param("id") movieId: string,
    @Param("artworkId") artworkId: string,
    @CurrentUser("userId") userId: string
  ) {
    const result = await this.movieService.deleteArtwork(movieId, artworkId);

    await this.auditService.log({
      adminUserId: userId,
      action: "delete_movie_artwork",
      targetType: "Artwork",
      targetId: artworkId,
      diffJson: { movieId },
    });

    return result;
  }

  // ==================== BULK OPERATIONS ====================
  @Post("bulk-import")
  @RequirePermissions(PERMISSIONS.CONTENT_MOVIES_CREATE)
  @ApiOperation({ summary: "Bulk import movies from CSV/JSON (Admin)" })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("file"))
  async bulkImportMovies(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser("userId") userId: string
  ) {
    const result = await this.movieService.bulkImport(file);

    await this.auditService.log({
      adminUserId: userId,
      action: "bulk_import_movies",
      targetType: "Movie",
      diffJson: { filename: file.originalname, count: result.success },
    });

    return result;
  }

  @Post("bulk-update-status")
  @RequirePermissions(PERMISSIONS.CONTENT_MOVIES_UPDATE)
  @ApiOperation({ summary: "Bulk update movie statuses (Admin)" })
  async bulkUpdateMovieStatus(
    @Body() bulkUpdateDto: { movieIds: string[]; status: MovieStatus },
    @CurrentUser("userId") userId: string
  ) {
    const result = await this.movieService.bulkUpdateStatus(
      bulkUpdateDto.movieIds,
      bulkUpdateDto.status
    );

    await this.auditService.log({
      adminUserId: userId,
      action: "bulk_update_movie_status",
      targetType: "Movie",
      targetId: bulkUpdateDto.movieIds.join(","),
      diffJson: { count: result.count, status: bulkUpdateDto.status },
    });

    return result;
  }

  @Delete("bulk-delete")
  @RequirePermissions(PERMISSIONS.CONTENT_MOVIES_DELETE)
  @ApiOperation({ summary: "Bulk delete movies (Admin)" })
  async bulkDeleteMovies(
    @Body() bulkDeleteDto: { movieIds: string[] },
    @CurrentUser("userId") userId: string
  ) {
    const result = await this.movieService.bulkDelete(bulkDeleteDto.movieIds);

    await this.auditService.log({
      adminUserId: userId,
      action: "bulk_delete_movies",
      targetType: "Movie",
      targetId: bulkDeleteDto.movieIds.join(","),
      diffJson: { count: result.count },
    });

    return result;
  }
}
