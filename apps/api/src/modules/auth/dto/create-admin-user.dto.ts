import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsArray,
  IsUUID,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateAdminUserDto {
  @ApiProperty({ example: "admin" })
  @IsString()
  username!: string;

  @ApiProperty({ example: "admin@moviesite.com" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "John Admin" })
  @IsString()
  name!: string;

  @ApiProperty({ example: "password123" })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID("4", { each: true })
  roleIds?: string[];
}
