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
  ParseIntPipe,
  DefaultValuePipe,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiQuery,
  ApiResponse,
} from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";

import { CountriesService } from "./countries.service";
import { CreateCountryDto, UpdateCountryDto } from "./dto/countries.dto";

@ApiTags("Countries")
@Controller("admin/countries")
@UseGuards(AuthGuard("jwt"))
@ApiBearerAuth()
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  @Post()
  @ApiOperation({ summary: "Create a new country" })
  @ApiResponse({ status: 201, description: "Country created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 409, description: "Country code already exists" })
  create(@Body() createCountryDto: CreateCountryDto) {
    return this.countriesService.create(createCountryDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all countries with pagination and filters" })
  @ApiQuery({
    name: "search",
    required: false,
    description: "Search by name, code, or native name",
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
    description: "Sort by field (default: name)",
  })
  @ApiQuery({
    name: "sortOrder",
    required: false,
    enum: ["asc", "desc"],
    description: "Sort order (default: asc)",
  })
  @ApiResponse({ status: 200, description: "List of countries" })
  findAll(
    @Query("search") search?: string,
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query("limit", new DefaultValuePipe(20), ParseIntPipe) limit?: number,
    @Query("sortBy") sortBy?: string,
    @Query("sortOrder") sortOrder?: "asc" | "desc"
  ) {
    return this.countriesService.findAll({
      search,
      page,
      limit,
      sortBy,
      sortOrder,
    });
  }

  @Get("popular")
  @ApiOperation({ summary: "Get popular countries by movie count" })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Number of countries to return (default: 10)",
  })
  @ApiResponse({ status: 200, description: "List of popular countries" })
  getPopularCountries(
    @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit?: number
  ) {
    return this.countriesService.getPopularCountries(limit);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get country by ID" })
  @ApiResponse({ status: 200, description: "Country details" })
  @ApiResponse({ status: 404, description: "Country not found" })
  findOne(@Param("id") id: string) {
    return this.countriesService.findOne(id);
  }

  @Get("code/:code")
  @ApiOperation({ summary: "Get country by ISO code" })
  @ApiResponse({ status: 200, description: "Country details" })
  @ApiResponse({ status: 404, description: "Country not found" })
  findByCode(@Param("code") code: string) {
    return this.countriesService.findByCode(code);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update country by ID" })
  @ApiResponse({ status: 200, description: "Country updated successfully" })
  @ApiResponse({ status: 404, description: "Country not found" })
  @ApiResponse({ status: 409, description: "Country code already exists" })
  update(@Param("id") id: string, @Body() updateCountryDto: UpdateCountryDto) {
    return this.countriesService.update(id, updateCountryDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete country by ID" })
  @ApiResponse({ status: 200, description: "Country deleted successfully" })
  @ApiResponse({ status: 404, description: "Country not found" })
  @ApiResponse({ status: 409, description: "Cannot delete country in use" })
  remove(@Param("id") id: string) {
    return this.countriesService.remove(id);
  }
}
