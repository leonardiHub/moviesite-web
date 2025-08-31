import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  Length,
  IsUrl,
} from "class-validator";

export class CreateCountryDto {
  @ApiProperty({
    description: "Country name in English",
    example: "United States",
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  name!: string;

  @ApiProperty({
    description: "ISO 3166-1 alpha-2 country code",
    example: "US",
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 2)
  code!: string;
}

export class UpdateCountryDto {
  @ApiPropertyOptional({ description: "Country name in English" })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  name?: string;

  @ApiPropertyOptional({ description: "ISO 3166-1 alpha-2 country code" })
  @IsOptional()
  @IsString()
  @Length(2, 2)
  code?: string;
}
