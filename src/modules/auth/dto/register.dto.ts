import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsInt, IsOptional, IsString } from 'class-validator';
import { EGender, ERole } from 'src/common/common.enum';

import { UserDto } from './login.dto';

export class RegisterDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  password: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  username: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  imageUrlId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  gender?: EGender;

  @ApiProperty({ required: false })
  @IsOptional()
  dateOfBirth?: Date;

  @ApiHideProperty()
  @IsInt()
  @IsOptional()
  role?: ERole;
}

export class RegisterResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  user: UserDto;
}
