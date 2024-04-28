import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { EGender, ERole } from 'src/common/common.enum';

export class UpdateUserDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty()
  @IsOptional()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  username: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  password: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  imageUrlId?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  gender?: EGender;

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  dateOfBirth?: Date;

  @ApiHideProperty()
  @IsOptional()
  @IsOptional()
  @IsInt()
  role?: ERole;
}
