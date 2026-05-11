import { IsString, IsEmail, MinLength, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCouncilDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  domain: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  contactName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty()
  @IsEmail()
  adminEmail: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  adminPassword: string;
}
