import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional, IsNotEmpty, Length } from "class-validator";

export class CreateGenreDto {
  @ApiProperty({
    description: "Genre name",
    example: "Action",
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  genreName!: string;

  @ApiProperty({
    description: "Genre code",
    example: "ACT",
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 10)
  genreCode!: string;
}

export class UpdateGenreDto {
  @ApiPropertyOptional({ description: "Genre name" })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  genreName?: string;

  @ApiPropertyOptional({ description: "Genre code" })
  @IsOptional()
  @IsString()
  @Length(2, 10)
  genreCode?: string;
}
