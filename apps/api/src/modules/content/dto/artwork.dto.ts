import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsNumber, IsOptional, IsEnum } from "class-validator";

export enum ArtworkKind {
  POSTER = "poster",
  BACKDROP = "backdrop",
  SPRITE = "sprite",
  THUMBNAIL = "thumbnail",
  LOGO = "logo",
}

export class CreateArtworkDto {
  @ApiProperty({ description: "Artwork type", enum: ArtworkKind })
  @IsEnum(ArtworkKind)
  kind!: ArtworkKind;

  @ApiProperty({ description: "Movie ID" })
  @IsString()
  movieId!: string;

  @ApiPropertyOptional({ description: "Image width" })
  @IsOptional()
  @IsNumber()
  width?: number;

  @ApiPropertyOptional({ description: "Image height" })
  @IsOptional()
  @IsNumber()
  height?: number;

  @ApiPropertyOptional({ description: "Image metadata" })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class ArtworkResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: ArtworkKind })
  kind!: ArtworkKind;

  @ApiProperty()
  movieId!: string;

  @ApiProperty()
  url!: string;

  @ApiPropertyOptional()
  width?: number;

  @ApiPropertyOptional()
  height?: number;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class UploadArtworkResponseDto {
  @ApiProperty()
  artwork!: ArtworkResponseDto;

  @ApiProperty()
  uploadUrl!: string;

  @ApiProperty()
  fields!: Record<string, string>;
}
