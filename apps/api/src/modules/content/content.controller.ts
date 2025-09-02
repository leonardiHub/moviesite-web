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
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import {
  FileInterceptor,
  FileFieldsInterceptor,
} from "@nestjs/platform-express";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from "@nestjs/swagger";

import { MovieService } from "./movie.service";
import { SeriesService } from "./series.service";
import { PersonService } from "./person.service";
import { GenreService } from "./genre.service";
import { TagService } from "./tag.service";
import { CollectionService } from "./collection.service";
import { HomepageService } from "./homepage.service";
import { MediaService } from "./media.service";
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
} from "./dto/movie.dto";
import {
  CreateArtworkDto,
  ArtworkResponseDto,
  UploadArtworkResponseDto,
  ArtworkKind,
} from "./dto/artwork.dto";

@ApiTags("Content Management")
@Controller("content")
@UseGuards(AuthGuard("jwt"))
@ApiBearerAuth()
export class ContentController {
  constructor(
    private movieService: MovieService,
    private seriesService: SeriesService,
    private personService: PersonService,
    private genreService: GenreService,
    private tagService: TagService,
    private collectionService: CollectionService,
    private homepageService: HomepageService,
    private mediaService: MediaService,
    private auditService: AuditService
  ) {}

  // ==================== MOVIES ====================
  @Get("movies")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.CONTENT_MOVIES_VIEW)
  @ApiOperation({ summary: "Get all movies with pagination and filters" })
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
    @Query("year", new DefaultValuePipe(undefined)) year?: number,
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query("limit", new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
    @Query("sortBy", new DefaultValuePipe("updatedAt"))
    sortBy: string = "updatedAt",
    @Query("sortOrder", new DefaultValuePipe("desc"))
    sortOrder: "asc" | "desc" = "desc"
  ) {
    return this.movieService.findAll({
      search,
      status,
      genreId,
      tagId,
      year,
      page,
      limit,
      sortBy,
      sortOrder,
    });
  }

  @Get("movies/stats")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.CONTENT_MOVIES_VIEW)
  @ApiOperation({ summary: "Get movie statistics" })
  async getMovieStats() {
    return this.movieService.getStats();
  }

  @Get("movies/:id")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.CONTENT_MOVIES_VIEW)
  @ApiOperation({ summary: "Get movie by ID" })
  @ApiResponse({
    status: 200,
    description: "Movie retrieved successfully",
    type: MovieResponseDto,
  })
  async getMovie(@Param("id") id: string) {
    return this.movieService.findOne(id);
  }

  @Post("movies")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.CONTENT_MOVIES_CREATE)
  @ApiOperation({ summary: "Create a new movie" })
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
    @Body() createMovieDto: CreateMovieDto,
    @CurrentUser("userId") userId: string,
    @UploadedFiles()
    files?: {
      poster?: Express.Multer.File[];
      videoFile?: Express.Multer.File[];
    }
  ) {
    // Add files to the DTO if provided
    if (files?.poster?.[0]) {
      createMovieDto.posterFile = files.poster[0];
    }
    if (files?.videoFile?.[0]) {
      createMovieDto.videoFile = files.videoFile[0];
    }

    const result = await this.movieService.create(createMovieDto);

    await this.auditService.log({
      adminUserId: userId,
      action: "create_movie",
      targetType: "Movie",
      targetId: result.id,
      diffJson: { title: result.title },
    });

    return result;
  }

  @Put("movies/:id")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.CONTENT_MOVIES_UPDATE)
  @ApiOperation({ summary: "Update an existing movie" })
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
    @Body() updateMovieDto: UpdateMovieDto,
    @CurrentUser("userId") userId: string,
    @UploadedFiles()
    files?: {
      poster?: Express.Multer.File[];
      videoFile?: Express.Multer.File[];
    }
  ) {
    // Add files to the DTO if provided
    if (files?.poster?.[0]) {
      updateMovieDto.posterFile = files.poster[0];
    }
    if (files?.videoFile?.[0]) {
      updateMovieDto.videoFile = files.videoFile[0];
    }

    const result = await this.movieService.update(id, updateMovieDto);

    await this.auditService.log({
      adminUserId: userId,
      action: "update_movie",
      targetType: "Movie",
      targetId: id,
      diffJson: updateMovieDto,
    });

    return result;
  }

  @Delete("movies/:id")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.CONTENT_MOVIES_DELETE)
  @ApiOperation({ summary: "Delete a movie" })
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

  // ==================== MOVIE ARTWORKS ====================
  @Post("movies/:id/artworks")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.CONTENT_MOVIES_UPDATE)
  @ApiOperation({ summary: "Create artwork record for movie" })
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

  @Post("movies/:id/artworks/:artworkId/upload")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.CONTENT_MOVIES_UPDATE)
  @ApiOperation({ summary: "Generate upload URL for movie artwork" })
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

  @Delete("movies/:id/artworks/:artworkId")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.CONTENT_MOVIES_UPDATE)
  @ApiOperation({ summary: "Delete movie artwork" })
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
  @Post("movies/bulk-import")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.CONTENT_MOVIES_CREATE)
  @ApiOperation({ summary: "Bulk import movies from CSV/JSON" })
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

  @Post("movies/bulk-update-status")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.CONTENT_MOVIES_UPDATE)
  @ApiOperation({ summary: "Bulk update movie statuses" })
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
      diffJson: { count: result.count, status: bulkUpdateDto.status },
    });

    return result;
  }

  @Delete("movies/bulk-delete")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.CONTENT_MOVIES_DELETE)
  @ApiOperation({ summary: "Bulk delete movies" })
  async bulkDeleteMovies(
    @Body() bulkDeleteDto: { movieIds: string[] },
    @CurrentUser("userId") userId: string
  ) {
    const result = await this.movieService.bulkDelete(bulkDeleteDto.movieIds);

    await this.auditService.log({
      adminUserId: userId,
      action: "bulk_delete_movies",
      targetType: "Movie",
      diffJson: { count: result.count },
    });

    return result;
  }

  // ==================== SERIES ====================
  @Get("series")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.CONTENT_SERIES_VIEW)
  @ApiOperation({ summary: "Get all series" })
  async getSeries(
    @Query("search") search?: string,
    @Query("status") status?: string,
    @Query("genreId") genreId?: string,
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query("limit", new DefaultValuePipe(20), ParseIntPipe) limit: number = 20
  ) {
    return this.seriesService.findAll({ search, status, genreId, page, limit });
  }

  @Get("series/:id")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.CONTENT_SERIES_VIEW)
  @ApiOperation({ summary: "Get series by ID" })
  async getSeriesById(@Param("id") id: string) {
    return this.seriesService.findOne(id);
  }

  @Post("series")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.CONTENT_SERIES_CREATE)
  @ApiOperation({ summary: "Create series" })
  async createSeries(
    @Body()
    createSeriesDto: {
      title: string;
      synopsis?: string;
      status?: string;
      genreIds?: string[];
      tagIds?: string[];
    },
    @CurrentUser("userId") userId: string
  ) {
    const result = await this.seriesService.create(createSeriesDto);

    await this.auditService.log({
      adminUserId: userId,
      action: "create_series",
      targetType: "Series",
      targetId: result.id,
      diffJson: { title: result.title },
    });

    return result;
  }

  @Put("series/:id")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.CONTENT_SERIES_UPDATE)
  @ApiOperation({ summary: "Update series" })
  async updateSeries(
    @Param("id") id: string,
    @Body()
    updateSeriesDto: {
      title?: string;
      synopsis?: string;
      status?: string;
      genreIds?: string[];
      tagIds?: string[];
    },
    @CurrentUser("userId") userId: string
  ) {
    const result = await this.seriesService.update(id, updateSeriesDto);

    await this.auditService.log({
      adminUserId: userId,
      action: "update_series",
      targetType: "Series",
      targetId: id,
      diffJson: updateSeriesDto,
    });

    return result;
  }

  @Delete("series/:id")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.CONTENT_SERIES_DELETE)
  @ApiOperation({ summary: "Delete series" })
  async deleteSeries(
    @Param("id") id: string,
    @CurrentUser("userId") userId: string
  ) {
    const result = await this.seriesService.delete(id);

    await this.auditService.log({
      adminUserId: userId,
      action: "delete_series",
      targetType: "Series",
      targetId: id,
    });

    return result;
  }

  @Post("series/:id/seasons")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.CONTENT_SERIES_UPDATE)
  @ApiOperation({ summary: "Create season" })
  async createSeason(
    @Param("id") seriesId: string,
    @Body()
    createSeasonDto: {
      seq: number;
      title?: string;
      synopsis?: string;
    },
    @CurrentUser("userId") userId: string
  ) {
    const result = await this.seriesService.createSeason(
      seriesId,
      createSeasonDto
    );

    await this.auditService.log({
      adminUserId: userId,
      action: "create_season",
      targetType: "Season",
      targetId: result.id,
      diffJson: { seriesId, seq: result.seq },
    });

    return result;
  }

  @Post("seasons/:id/episodes")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.CONTENT_SERIES_UPDATE)
  @ApiOperation({ summary: "Create episode" })
  async createEpisode(
    @Param("id") seasonId: string,
    @Body()
    createEpisodeDto: {
      seq: number;
      title: string;
      synopsis?: string;
      runtime?: number;
    },
    @CurrentUser("userId") userId: string
  ) {
    const result = await this.seriesService.createEpisode(
      seasonId,
      createEpisodeDto
    );

    await this.auditService.log({
      adminUserId: userId,
      action: "create_episode",
      targetType: "Episode",
      targetId: result.id,
      diffJson: { seasonId, seq: result.seq, title: result.title },
    });

    return result;
  }

  // ==================== PEOPLE ====================
  @Get("people")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.CONTENT_PEOPLE_VIEW)
  @ApiOperation({ summary: "Get all people" })
  async getPeople(
    @Query("search") search?: string,
    @Query("role") role?: string,
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query("limit", new DefaultValuePipe(20), ParseIntPipe) limit: number = 20
  ) {
    return this.personService.findAll({ search, role, page, limit });
  }

  @Get("people/stats")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.CONTENT_PEOPLE_VIEW)
  @ApiOperation({ summary: "Get people statistics" })
  async getPeopleStats() {
    return this.personService.getStats();
  }

  @Get("people/:id")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.CONTENT_PEOPLE_VIEW)
  @ApiOperation({ summary: "Get person by ID" })
  async getPerson(@Param("id") id: string) {
    return this.personService.findOne(id);
  }

  @Post("people")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.CONTENT_PEOPLE_CREATE)
  @ApiOperation({ summary: "Create person" })
  async createPerson(
    @Body() createPersonDto: { name: string; avatar?: string },
    @CurrentUser("userId") userId: string
  ) {
    const result = await this.personService.create(createPersonDto);

    await this.auditService.log({
      adminUserId: userId,
      action: "create_person",
      targetType: "Person",
      targetId: result.id,
      diffJson: { name: result.name },
    });

    return result;
  }

  @Put("people/:id")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.CONTENT_PEOPLE_UPDATE)
  @ApiOperation({ summary: "Update person" })
  async updatePerson(
    @Param("id") id: string,
    @Body() updatePersonDto: { name?: string; avatar?: string },
    @CurrentUser("userId") userId: string
  ) {
    const result = await this.personService.update(id, updatePersonDto);

    await this.auditService.log({
      adminUserId: userId,
      action: "update_person",
      targetType: "Person",
      targetId: id,
      diffJson: updatePersonDto,
    });

    return result;
  }

  @Delete("people/:id")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.CONTENT_PEOPLE_DELETE)
  @ApiOperation({ summary: "Delete person" })
  async deletePerson(
    @Param("id") id: string,
    @CurrentUser("userId") userId: string
  ) {
    const result = await this.personService.delete(id);

    await this.auditService.log({
      adminUserId: userId,
      action: "delete_person",
      targetType: "Person",
      targetId: id,
    });

    return result;
  }

  @Post("people/bulk-import")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.CONTENT_PEOPLE_CREATE)
  @ApiOperation({ summary: "Bulk import people" })
  async bulkImportPeople(
    @Body() { people }: { people: Array<{ name: string; avatar?: string }> },
    @CurrentUser("userId") userId: string
  ) {
    const result = await this.personService.bulkImport(people);

    await this.auditService.log({
      adminUserId: userId,
      action: "bulk_import_people",
      diffJson: { imported: result.success, failed: result.failed },
    });

    return result;
  }

  @Post("credits")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.CONTENT_PEOPLE_UPDATE)
  @ApiOperation({ summary: "Add credit" })
  async addCredit(
    @Body()
    addCreditDto: {
      personId: string;
      movieId?: string;
      episodeId?: string;
      seriesId?: string;
      role: string;
    },
    @CurrentUser("userId") userId: string
  ) {
    const result = await this.personService.addCredit(addCreditDto);

    await this.auditService.log({
      adminUserId: userId,
      action: "add_credit",
      targetType: "Credit",
      targetId: result.id,
      diffJson: addCreditDto,
    });

    return result;
  }

  @Delete("credits/:id")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.CONTENT_PEOPLE_UPDATE)
  @ApiOperation({ summary: "Remove credit" })
  async removeCredit(
    @Param("id") id: string,
    @CurrentUser("userId") userId: string
  ) {
    const result = await this.personService.removeCredit(id);

    await this.auditService.log({
      adminUserId: userId,
      action: "remove_credit",
      targetType: "Credit",
      targetId: id,
    });

    return result;
  }

  // ==================== GENRES ====================
  @Get("genres")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.CONTENT_MOVIES_VIEW)
  @ApiOperation({ summary: "Get all genres" })
  async getGenres() {
    return this.genreService.findAll();
  }

  @Get("genres/popular")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.CONTENT_MOVIES_VIEW)
  @ApiOperation({ summary: "Get popular genres" })
  async getPopularGenres(
    @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit: number = 10
  ) {
    return this.genreService.getPopularGenres(limit);
  }

  @Get("genres/:id")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.CONTENT_MOVIES_VIEW)
  @ApiOperation({ summary: "Get genre by ID" })
  async getGenre(@Param("id") id: string) {
    return this.genreService.findOne(id);
  }

  @Post("genres")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.CONTENT_MOVIES_UPDATE)
  @ApiOperation({ summary: "Create genre" })
  async createGenre(
    @Body() createGenreDto: { name: string },
    @CurrentUser("userId") userId: string
  ) {
    const result = await this.genreService.create(createGenreDto);

    await this.auditService.log({
      adminUserId: userId,
      action: "create_genre",
      targetType: "Genre",
      targetId: result.id,
      diffJson: { name: result.name },
    });

    return result;
  }

  @Put("genres/:id")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.CONTENT_MOVIES_UPDATE)
  @ApiOperation({ summary: "Update genre" })
  async updateGenre(
    @Param("id") id: string,
    @Body() updateGenreDto: { name: string },
    @CurrentUser("userId") userId: string
  ) {
    const result = await this.genreService.update(id, updateGenreDto);

    await this.auditService.log({
      adminUserId: userId,
      action: "update_genre",
      targetType: "Genre",
      targetId: id,
      diffJson: updateGenreDto,
    });

    return result;
  }

  @Delete("genres/:id")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.CONTENT_MOVIES_UPDATE)
  @ApiOperation({ summary: "Delete genre" })
  async deleteGenre(
    @Param("id") id: string,
    @CurrentUser("userId") userId: string
  ) {
    const result = await this.genreService.delete(id);

    await this.auditService.log({
      adminUserId: userId,
      action: "delete_genre",
      targetType: "Genre",
      targetId: id,
    });

    return result;
  }

  // ==================== TAGS ====================
  @Get("tags")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.CONTENT_MOVIES_VIEW)
  @ApiOperation({ summary: "Get all tags" })
  async getTags() {
    return this.tagService.findAll();
  }

  @Get("tags/popular")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.CONTENT_MOVIES_VIEW)
  @ApiOperation({ summary: "Get popular tags" })
  async getPopularTags(
    @Query("limit", new DefaultValuePipe(20), ParseIntPipe) limit: number = 20
  ) {
    return this.tagService.getPopularTags(limit);
  }

  @Post("tags")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.CONTENT_MOVIES_UPDATE)
  @ApiOperation({ summary: "Create tag" })
  async createTag(
    @Body() createTagDto: { name: string },
    @CurrentUser("userId") userId: string
  ) {
    const result = await this.tagService.create(createTagDto);

    await this.auditService.log({
      adminUserId: userId,
      action: "create_tag",
      targetType: "Tag",
      targetId: result.id,
      diffJson: { name: result.name },
    });

    return result;
  }

  @Post("tags/bulk-create")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.CONTENT_MOVIES_UPDATE)
  @ApiOperation({ summary: "Bulk create tags" })
  async bulkCreateTags(
    @Body() { names }: { names: string[] },
    @CurrentUser("userId") userId: string
  ) {
    const result = await this.tagService.bulkCreate(names);

    await this.auditService.log({
      adminUserId: userId,
      action: "bulk_create_tags",
      diffJson: { created: result.success, failed: result.failed },
    });

    return result;
  }

  // ==================== COLLECTIONS ====================
  @Get("collections")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.CONTENT_COLLECTIONS_VIEW)
  @ApiOperation({ summary: "Get all collections" })
  async getCollections(
    @Query("search") search?: string,
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query("limit", new DefaultValuePipe(20), ParseIntPipe) limit: number = 20
  ) {
    return this.collectionService.findAll({ search, page, limit });
  }

  @Get("collections/stats")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.CONTENT_COLLECTIONS_VIEW)
  @ApiOperation({ summary: "Get collection statistics" })
  async getCollectionStats() {
    return this.collectionService.getStats();
  }

  @Get("collections/:id")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.CONTENT_COLLECTIONS_VIEW)
  @ApiOperation({ summary: "Get collection by ID" })
  async getCollection(@Param("id") id: string) {
    return this.collectionService.findOne(id);
  }

  @Post("collections")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.CONTENT_COLLECTIONS_CREATE)
  @ApiOperation({ summary: "Create collection" })
  async createCollection(
    @Body() createCollectionDto: { name: string; description?: string },
    @CurrentUser("userId") userId: string
  ) {
    const result = await this.collectionService.create(createCollectionDto);

    await this.auditService.log({
      adminUserId: userId,
      action: "create_collection",
      targetType: "Collection",
      targetId: result.id,
      diffJson: { name: result.name },
    });

    return result;
  }

  @Post("collections/:id/items")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.CONTENT_COLLECTIONS_UPDATE)
  @ApiOperation({ summary: "Add item to collection" })
  async addToCollection(
    @Param("id") collectionId: string,
    @Body()
    addItemDto: {
      ownerType: "movie" | "series";
      ownerId: string;
      order?: number;
    },
    @CurrentUser("userId") userId: string
  ) {
    const result = await this.collectionService.addItem(
      collectionId,
      addItemDto
    );

    await this.auditService.log({
      adminUserId: userId,
      action: "add_collection_item",
      targetType: "Collection",
      targetId: collectionId,
      diffJson: addItemDto,
    });

    return result;
  }

  @Put("collections/:id/reorder")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.CONTENT_COLLECTIONS_UPDATE)
  @ApiOperation({ summary: "Reorder collection items" })
  async reorderCollection(
    @Param("id") collectionId: string,
    @Body()
    { itemOrders }: { itemOrders: Array<{ id: string; order: number }> },
    @CurrentUser("userId") userId: string
  ) {
    const result = await this.collectionService.reorderItems(
      collectionId,
      itemOrders
    );

    await this.auditService.log({
      adminUserId: userId,
      action: "reorder_collection",
      targetType: "Collection",
      targetId: collectionId,
    });

    return result;
  }

  // ==================== HOMEPAGE ====================
  @Get("homepage/sections")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.CONTENT_HOMEPAGE_VIEW)
  @ApiOperation({ summary: "Get homepage sections" })
  async getHomepageSections() {
    return this.homepageService.getSections();
  }

  @Get("homepage/preview")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.CONTENT_HOMEPAGE_VIEW)
  @ApiOperation({ summary: "Preview homepage with resolved content" })
  async previewHomepage() {
    return this.homepageService.previewHomepage();
  }

  @Post("homepage/sections")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.CONTENT_HOMEPAGE_UPDATE)
  @ApiOperation({ summary: "Create homepage section" })
  async createHomepageSection(
    @Body()
    createSectionDto: {
      key: string;
      title: string;
      layout: "hero" | "carousel" | "grid";
      config: any;
      order?: number;
    },
    @CurrentUser("userId") userId: string
  ) {
    const result = await this.homepageService.createSection(createSectionDto);

    await this.auditService.log({
      adminUserId: userId,
      action: "create_homepage_section",
      targetType: "HomepageSection",
      targetId: result.id,
      diffJson: { key: result.key, title: result.title },
    });

    return result;
  }

  @Put("homepage/sections/reorder")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.CONTENT_HOMEPAGE_UPDATE)
  @ApiOperation({ summary: "Reorder homepage sections" })
  async reorderHomepageSections(
    @Body()
    { sectionOrders }: { sectionOrders: Array<{ id: string; order: number }> },
    @CurrentUser("userId") userId: string
  ) {
    const result = await this.homepageService.reorderSections(sectionOrders);

    await this.auditService.log({
      adminUserId: userId,
      action: "reorder_homepage_sections",
    });

    return result;
  }

  // ==================== MEDIA ====================
  @Post("media/artwork")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.CONTENT_MOVIES_UPDATE)
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "Upload artwork" })
  async uploadArtwork(
    @UploadedFile() file: Express.Multer.File,
    @Body()
    uploadArtworkDto: {
      ownerType: "movie" | "episode" | "series" | "season";
      ownerId: string;
      kind: "poster" | "backdrop" | "sprite";
    },
    @CurrentUser("userId") userId: string
  ) {
    const result = await this.mediaService.uploadArtwork({
      ...uploadArtworkDto,
      file: {
        buffer: file.buffer,
        mimetype: file.mimetype,
        originalname: file.originalname,
      },
    });

    await this.auditService.log({
      adminUserId: userId,
      action: "upload_artwork",
      targetType: "Artwork",
      targetId: result.id,
      diffJson: uploadArtworkDto,
    });

    return result;
  }

  @Post("media/subtitle")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.CONTENT_MOVIES_UPDATE)
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "Upload subtitle" })
  async uploadSubtitle(
    @UploadedFile() file: Express.Multer.File,
    @Body()
    uploadSubtitleDto: {
      ownerType: "movie" | "episode";
      ownerId: string;
      lang: string;
      format: "srt" | "vtt" | "ass";
      isDefault?: boolean;
    },
    @CurrentUser("userId") userId: string
  ) {
    const result = await this.mediaService.uploadSubtitle({
      ...uploadSubtitleDto,
      file: {
        buffer: file.buffer,
        mimetype: file.mimetype,
        originalname: file.originalname,
      },
    });

    await this.auditService.log({
      adminUserId: userId,
      action: "upload_subtitle",
      targetType: "Subtitle",
      targetId: result.id,
      diffJson: uploadSubtitleDto,
    });

    return result;
  }

  @Post("media/sources")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.CONTENT_MOVIES_UPDATE)
  @ApiOperation({ summary: "Add video source" })
  async addSource(
    @Body()
    addSourceDto: {
      ownerType: "movie" | "episode";
      ownerId: string;
      type: "hls" | "dash" | "mp4";
      url: string;
      quality?: string;
      drmFlag?: boolean;
      regionLimit?: string[];
    },
    @CurrentUser("userId") userId: string
  ) {
    const result = await this.mediaService.addSource(addSourceDto);

    await this.auditService.log({
      adminUserId: userId,
      action: "add_source",
      targetType: "Source",
      targetId: result.id,
      diffJson: addSourceDto,
    });

    return result;
  }

  @Get("media/stats")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.CONTENT_MOVIES_VIEW)
  @ApiOperation({ summary: "Get media statistics" })
  async getMediaStats() {
    return this.mediaService.getMediaStats();
  }

  @Post("media/upload-url")
  @UseGuards(RbacGuard)
  @RequirePermissions(PERMISSIONS.CONTENT_MOVIES_UPDATE)
  @ApiOperation({ summary: "Generate upload URL" })
  async generateUploadUrl(
    @Body()
    uploadUrlDto: {
      type: "poster" | "backdrop" | "avatar" | "logo" | "sponsor" | "subtitle";
      filename: string;
      contentType: string;
    }
  ) {
    return this.mediaService.generateUploadUrl(uploadUrlDto);
  }
}
