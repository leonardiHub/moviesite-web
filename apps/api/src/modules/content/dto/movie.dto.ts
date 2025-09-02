import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsEnum,
  Min,
  Max,
  IsUrl,
  IsNotEmpty,
} from "class-validator";

export enum MovieStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}

export class CreateMovieDto {
  @ApiProperty({ description: "Movie title" })
  @IsString()
  title!: string;

  @ApiPropertyOptional({ description: "Original title in original language" })
  @IsOptional()
  @IsString()
  originalTitle?: string;

  @ApiPropertyOptional({ description: "Movie synopsis/description" })
  @IsOptional()
  @IsString()
  synopsis?: string;

  @ApiPropertyOptional({ description: "Release year" })
  @IsOptional()
  @IsNumber()
  @Min(1900)
  @Max(new Date().getFullYear() + 5)
  year?: number;

  @ApiPropertyOptional({ description: "Runtime in minutes" })
  @IsOptional()
  @IsNumber()
  @Min(1)
  runtime?: number;

  @ApiPropertyOptional({ description: "Age rating (PG, PG-13, R, etc.)" })
  @IsOptional()
  @IsString()
  ageRating?: string;

  @ApiPropertyOptional({ description: "Production countries" })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  countries?: string[];

  @ApiProperty({
    description: "Movie status",
    enum: MovieStatus,
    default: MovieStatus.DRAFT,
  })
  @IsEnum(MovieStatus)
  status: MovieStatus = MovieStatus.DRAFT;

  @ApiPropertyOptional({ description: "Genre IDs" })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  genreIds?: string[];

  @ApiPropertyOptional({ description: "Tag IDs" })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagIds?: string[];

  @ApiPropertyOptional({ description: "Cast and crew credits" })
  @IsOptional()
  @IsArray()
  credits?: Array<{ personId: string; role: string }>;

  @ApiPropertyOptional({ description: "Rating (0-10)" })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  rating?: number;

  @ApiPropertyOptional({ description: "Director name" })
  @IsOptional()
  @IsString()
  director?: string;

  @ApiPropertyOptional({ description: "Cast members" })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cast?: string[];

  @ApiPropertyOptional({ description: "Poster image file (for upload)" })
  @IsOptional()
  posterFile?: Express.Multer.File;

  @ApiPropertyOptional({ description: "Poster URL (if already uploaded)" })
  @IsOptional()
  posterUrl?: string;

  @ApiPropertyOptional({ description: "Video file (for upload)" })
  @IsOptional()
  videoFile?: Express.Multer.File;

  @ApiPropertyOptional({ description: "Video URL (if already uploaded)" })
  @IsOptional()
  videoUrl?: string;

  @ApiPropertyOptional({ description: "YouTube trailer URL" })
  @IsOptional()
  @IsString()
  trailerUrl?: string;
}

export class UpdateMovieDto {
  @ApiPropertyOptional({ description: "Movie title" })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: "Original title in original language" })
  @IsOptional()
  @IsString()
  originalTitle?: string;

  @ApiPropertyOptional({ description: "Movie synopsis/description" })
  @IsOptional()
  @IsString()
  synopsis?: string;

  @ApiPropertyOptional({ description: "Release year" })
  @IsOptional()
  @IsNumber()
  @Min(1900)
  @Max(new Date().getFullYear() + 5)
  year?: number;

  @ApiPropertyOptional({ description: "Runtime in minutes" })
  @IsOptional()
  @IsNumber()
  @Min(1)
  runtime?: number;

  @ApiPropertyOptional({ description: "Age rating (PG, PG-13, R, etc.)" })
  @IsOptional()
  @IsString()
  ageRating?: string;

  @ApiPropertyOptional({ description: "Production countries" })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  countries?: string[];

  @ApiPropertyOptional({ description: "Movie status", enum: MovieStatus })
  @IsOptional()
  @IsEnum(MovieStatus)
  status?: MovieStatus;

  @ApiPropertyOptional({ description: "Genre IDs" })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  genreIds?: string[];

  @ApiPropertyOptional({ description: "Tag IDs" })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagIds?: string[];

  @ApiPropertyOptional({ description: "Cast and crew credits" })
  @IsOptional()
  @IsArray()
  credits?: Array<{ personId: string; role: string }>;

  @ApiPropertyOptional({ description: "Rating (0-10)" })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  rating?: number;

  @ApiPropertyOptional({ description: "Director name" })
  @IsOptional()
  @IsString()
  director?: string;

  @ApiPropertyOptional({ description: "Cast members" })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cast?: string[];

  @ApiPropertyOptional({ description: "Poster image file (for upload)" })
  @IsOptional()
  posterFile?: Express.Multer.File;

  @ApiPropertyOptional({ description: "Poster URL (if already uploaded)" })
  @IsOptional()
  posterUrl?: string;

  @ApiPropertyOptional({ description: "Video file (for upload)" })
  @IsOptional()
  videoFile?: Express.Multer.File;

  @ApiPropertyOptional({ description: "Video URL (if already uploaded)" })
  @IsOptional()
  videoUrl?: string;

  @ApiPropertyOptional({ description: "YouTube trailer URL" })
  @IsOptional()
  @IsString()
  trailerUrl?: string;
}

export class MovieResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiPropertyOptional()
  originalTitle?: string;

  @ApiPropertyOptional()
  synopsis?: string;

  @ApiPropertyOptional()
  year?: number;

  @ApiPropertyOptional()
  runtime?: number;

  @ApiPropertyOptional()
  ageRating?: string;

  @ApiProperty()
  countries!: string[];

  @ApiProperty({ enum: MovieStatus })
  status!: MovieStatus;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiPropertyOptional()
  rating?: number;

  @ApiPropertyOptional()
  director?: string;

  @ApiPropertyOptional()
  cast?: string[];

  @ApiProperty()
  genres!: Array<{ id: string; name: string }>;

  @ApiProperty()
  tags!: Array<{ id: string; name: string }>;

  @ApiProperty()
  artworks!: Array<{
    id: string;
    kind: string;
    url: string;
    width?: number;
    height?: number;
  }>;

  @ApiPropertyOptional({ description: "Primary poster URL" })
  posterUrl?: string;

  @ApiPropertyOptional({ description: "Primary poster artwork ID" })
  posterId?: string;

  @ApiPropertyOptional({ description: "YouTube trailer URL" })
  trailerUrl?: string;

  @ApiProperty()
  _count!: {
    sources: number;
    subtitles: number;
  };
}

export class MovieListResponseDto {
  @ApiProperty({ type: [MovieResponseDto] })
  items!: MovieResponseDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  totalPages!: number;
}

export class MovieWithPosterDto {
  @ApiProperty()
  movie!: MovieResponseDto;

  @ApiPropertyOptional()
  posterUploadUrl?: string;

  @ApiPropertyOptional()
  posterUploadFields?: Record<string, string>;
}
