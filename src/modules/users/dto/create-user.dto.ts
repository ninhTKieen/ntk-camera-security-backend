import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { EGender, ERole } from 'src/common/common.enum';

export class CreateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsNotEmpty()
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
  @IsNotEmpty()
  @IsOptional()
  @IsInt()
  role?: ERole;
}
