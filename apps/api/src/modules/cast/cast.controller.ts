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
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiQuery,
  ApiResponse,
  ApiConsumes,
} from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { FileInterceptor } from "@nestjs/platform-express";

import { CastService } from "./cast.service";
import { CreateCastDto, UpdateCastDto } from "./dto/cast.dto";

@ApiTags("Cast")
@Controller("admin/cast")
@UseGuards(AuthGuard("jwt"))
@ApiBearerAuth()
export class CastController {
  constructor(private readonly castService: CastService) {}

  @Post()
  @ApiOperation({ summary: "Create a new cast member" })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("castImageFile"))
  @ApiResponse({ status: 201, description: "Cast member created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 409, description: "Cast member name already exists" })
  create(
    @Body() createCastDto: any,
    @UploadedFile() castImageFile?: Express.Multer.File
  ) {
    // Parse castData from FormData if it exists
    let parsedData = createCastDto;
    if (createCastDto.castData) {
      try {
        parsedData = JSON.parse(createCastDto.castData);
      } catch (error) {
        throw new Error("Invalid cast data format");
      }
    }

    return this.castService.create({
      ...parsedData,
      castImageFile,
    });
  }

  @Get()
  @ApiOperation({ summary: "Get all cast members with pagination and search" })
  @ApiQuery({
    name: "search",
    required: false,
    description: "Search by name or description",
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
    description: "Sort by field (default: castName)",
  })
  @ApiQuery({
    name: "sortOrder",
    required: false,
    enum: ["asc", "desc"],
    description: "Sort order (default: asc)",
  })
  @ApiResponse({ status: 200, description: "List of cast members" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  findAll(
    @Query("search") search?: string,
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query("limit", new DefaultValuePipe(20), ParseIntPipe) limit?: number,
    @Query("sortBy") sortBy?: string,
    @Query("sortOrder") sortOrder?: "asc" | "desc"
  ) {
    return this.castService.findAll({
      search,
      page,
      limit,
      sortBy,
      sortOrder,
    });
  }

  @Get("popular")
  @ApiOperation({ summary: "Get popular cast members by credit count" })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Number of cast members to return (default: 10)",
  })
  @ApiResponse({ status: 200, description: "List of popular cast members" })
  getPopularCast(
    @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit?: number
  ) {
    return this.castService.getPopularCast(limit);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a cast member by ID" })
  @ApiResponse({ status: 200, description: "Cast member found" })
  @ApiResponse({ status: 404, description: "Cast member not found" })
  findOne(@Param("id") id: string) {
    return this.castService.findOne(id);
  }

  @Get("name/:name")
  @ApiOperation({ summary: "Get a cast member by name" })
  @ApiResponse({ status: 200, description: "Cast member found" })
  @ApiResponse({ status: 404, description: "Cast member not found" })
  findByName(@Param("name") name: string) {
    return this.castService.findByName(name);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a cast member" })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("castImageFile"))
  @ApiResponse({ status: 200, description: "Cast member updated successfully" })
  @ApiResponse({ status: 404, description: "Cast member not found" })
  @ApiResponse({ status: 409, description: "Cast member name already exists" })
  update(
    @Param("id") id: string,
    @Body() updateCastDto: any,
    @UploadedFile() castImageFile?: Express.Multer.File
  ) {
    // Parse castData from FormData if it exists
    let parsedData = updateCastDto;
    if (updateCastDto.castData) {
      try {
        parsedData = JSON.parse(updateCastDto.castData);
      } catch (error) {
        throw new Error("Invalid cast data format");
      }
    }

    return this.castService.update(id, {
      ...parsedData,
      castImageFile,
    });
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a cast member" })
  @ApiResponse({ status: 200, description: "Cast member deleted successfully" })
  @ApiResponse({ status: 404, description: "Cast member not found" })
  @ApiResponse({ status: 409, description: "Cannot delete cast member in use" })
  remove(@Param("id") id: string) {
    return this.castService.remove(id);
  }
}
