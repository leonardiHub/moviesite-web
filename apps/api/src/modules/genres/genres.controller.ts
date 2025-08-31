import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  DefaultValuePipe,
  ParseIntPipe,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiQuery,
  ApiResponse,
} from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";

import { GenresService } from "./genres.service";
import { CreateGenreDto, UpdateGenreDto } from "./dto/genres.dto";

@ApiTags("Genres")
@Controller("admin/genres")
@UseGuards(AuthGuard("jwt"))
@ApiBearerAuth()
export class GenresController {
  constructor(private readonly genresService: GenresService) {}

  @Post()
  @ApiOperation({ summary: "Create a new genre" })
  @ApiResponse({ status: 201, description: "Genre created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 409, description: "Genre code already exists" })
  create(@Body() createGenreDto: CreateGenreDto) {
    return this.genresService.create(createGenreDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all genres with pagination and search" })
  @ApiQuery({
    name: "search",
    required: false,
    description: "Search by name or code",
  })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    description: "Page number (default: 1)",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Items per page (default: 20)",
  })
  @ApiQuery({
    name: "sortBy",
    required: false,
    description: "Sort by field (default: genreName)",
  })
  @ApiQuery({
    name: "sortOrder",
    required: false,
    enum: ["asc", "desc"],
    description: "Sort order (default: asc)",
  })
  @ApiResponse({ status: 200, description: "List of genres" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  findAll(
    @Query("search") search?: string,
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query("limit", new DefaultValuePipe(20), ParseIntPipe) limit?: number,
    @Query("sortBy") sortBy?: string,
    @Query("sortOrder") sortOrder?: "asc" | "desc"
  ) {
    return this.genresService.findAll({
      search,
      page,
      limit,
      sortBy,
      sortOrder,
    });
  }

  @Get("popular")
  @ApiOperation({ summary: "Get popular genres by usage count" })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Number of genres to return (default: 10)",
  })
  @ApiResponse({ status: 200, description: "List of popular genres" })
  getPopularGenres(
    @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit?: number
  ) {
    return this.genresService.getPopularGenres(limit);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a genre by ID" })
  @ApiResponse({ status: 200, description: "Genre found" })
  @ApiResponse({ status: 404, description: "Genre not found" })
  findOne(@Param("id") id: string) {
    return this.genresService.findOne(id);
  }

  @Get("code/:code")
  @ApiOperation({ summary: "Get a genre by code" })
  @ApiResponse({ status: 200, description: "Genre found" })
  @ApiResponse({ status: 404, description: "Genre not found" })
  findByCode(@Param("code") code: string) {
    return this.genresService.findByCode(code);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a genre" })
  @ApiResponse({ status: 200, description: "Genre updated successfully" })
  @ApiResponse({ status: 404, description: "Genre not found" })
  @ApiResponse({ status: 409, description: "Genre code already exists" })
  update(@Param("id") id: string, @Body() updateGenreDto: UpdateGenreDto) {
    return this.genresService.update(id, updateGenreDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a genre" })
  @ApiResponse({ status: 200, description: "Genre deleted successfully" })
  @ApiResponse({ status: 404, description: "Genre not found" })
  @ApiResponse({ status: 409, description: "Cannot delete genre in use" })
  remove(@Param("id") id: string) {
    return this.genresService.remove(id);
  }
}
