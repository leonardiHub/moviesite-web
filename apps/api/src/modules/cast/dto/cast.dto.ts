import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  Length,
  IsUrl,
} from "class-validator";

export class CreateCastDto {
  @ApiProperty({
    description: "Cast member name",
    example: "Tom Hanks",
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  castName!: string;

  @ApiPropertyOptional({
    description: "Cast member image file (for upload)",
  })
  @IsOptional()
  castImageFile?: Express.Multer.File;

  @ApiPropertyOptional({
    description: "Cast member image URL (if already uploaded)",
    example: "https://example.com/tom-hanks.jpg",
  })
  @IsOptional()
  @IsUrl()
  castImage?: string;

  @ApiPropertyOptional({
    description: "Cast member description or bio",
    example: "Academy Award-winning actor known for his versatile performances",
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  castDescription?: string;
}

export class UpdateCastDto {
  @ApiPropertyOptional({ description: "Cast member name" })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  castName?: string;

  @ApiPropertyOptional({
    description: "Cast member image file (for upload)",
  })
  @IsOptional()
  castImageFile?: Express.Multer.File;

  @ApiPropertyOptional({ description: "Cast member image URL" })
  @IsOptional()
  @IsUrl()
  castImage?: string;

  @ApiPropertyOptional({ description: "Cast member description or bio" })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  castDescription?: string;
}
