import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ERole } from 'src/common/common.enum';

export class UserDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  imageUrl: string;

  @ApiProperty()
  gender: string;

  @ApiProperty()
  dateOfBirth: Date;

  @ApiProperty({
    enum: ERole,
    enumName: 'ERole', // Assuming ERole is an enum
  })
  role: ERole;
}
export class LoginDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({ required: false })
  isRemember?: boolean;
}

export class LoginResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  user: UserDto;
}
