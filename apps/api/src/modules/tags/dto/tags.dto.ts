import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional, IsNotEmpty, Length } from "class-validator";

export class CreateTagDto {
  @ApiProperty({
    description: "Tag name",
    example: "Blockbuster",
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  tagName!: string;

  @ApiProperty({
    description: "Tag code",
    example: "BLKB",
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 10)
  tagCode!: string;
}

export class UpdateTagDto {
  @ApiPropertyOptional({ description: "Tag name" })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  tagName?: string;

  @ApiPropertyOptional({ description: "Tag code" })
  @IsOptional()
  @IsString()
  @Length(2, 10)
  tagCode?: string;
}
