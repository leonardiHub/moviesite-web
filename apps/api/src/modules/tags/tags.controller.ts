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

import { TagsService } from "./tags.service";
import { CreateTagDto, UpdateTagDto } from "./dto/tags.dto";

@ApiTags("Tags")
@Controller("admin/tags")
@UseGuards(AuthGuard("jwt"))
@ApiBearerAuth()
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new tag" })
  @ApiResponse({ status: 201, description: "Tag created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 409, description: "Tag code already exists" })
  create(@Body() createTagDto: CreateTagDto) {
    return this.tagsService.create(createTagDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all tags with pagination and search" })
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
    description: "Sort by field (default: tagName)",
  })
  @ApiQuery({
    name: "sortOrder",
    required: false,
    enum: ["asc", "desc"],
    description: "Sort order (default: asc)",
  })
  @ApiResponse({ status: 200, description: "List of tags" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  findAll(
    @Query("search") search?: string,
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query("limit", new DefaultValuePipe(20), ParseIntPipe) limit?: number,
    @Query("sortBy") sortBy?: string,
    @Query("sortOrder") sortOrder?: "asc" | "desc"
  ) {
    return this.tagsService.findAll({
      search,
      page,
      limit,
      sortBy,
      sortOrder,
    });
  }

  @Get("popular")
  @ApiOperation({ summary: "Get popular tags by usage count" })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Number of tags to return (default: 10)",
  })
  @ApiResponse({ status: 200, description: "List of popular tags" })
  getPopularTags(
    @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit?: number
  ) {
    return this.tagsService.getPopularTags(limit);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a tag by ID" })
  @ApiResponse({ status: 200, description: "Tag found" })
  @ApiResponse({ status: 404, description: "Tag not found" })
  findOne(@Param("id") id: string) {
    return this.tagsService.findOne(id);
  }

  @Get("code/:code")
  @ApiOperation({ summary: "Get a tag by code" })
  @ApiResponse({ status: 200, description: "Tag found" })
  @ApiResponse({ status: 404, description: "Tag not found" })
  findByCode(@Param("code") code: string) {
    return this.tagsService.findByCode(code);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a tag" })
  @ApiResponse({ status: 200, description: "Tag updated successfully" })
  @ApiResponse({ status: 404, description: "Tag not found" })
  @ApiResponse({ status: 409, description: "Tag code already exists" })
  update(@Param("id") id: string, @Body() updateTagDto: UpdateTagDto) {
    return this.tagsService.update(id, updateTagDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a tag" })
  @ApiResponse({ status: 200, description: "Tag deleted successfully" })
  @ApiResponse({ status: 404, description: "Tag not found" })
  @ApiResponse({ status: 409, description: "Cannot delete tag in use" })
  remove(@Param("id") id: string) {
    return this.tagsService.remove(id);
  }
}
