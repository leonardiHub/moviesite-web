import { IsString, MinLength, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordRequestDto {
  @ApiProperty({ example: 'admin@moviesite.com' })
  @IsEmail()
  email!: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'reset-token-here' })
  @IsString()
  token!: string;

  @ApiProperty({ example: 'newPassword123' })
  @IsString()
  @MinLength(8)
  newPassword!: string;
}
