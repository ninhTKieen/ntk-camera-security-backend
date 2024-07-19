import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { EWebAppType } from 'src/common/common.enum';

export class CreateFcmTokenDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    type: 'enum',
    enum: EWebAppType,
  })
  @IsEnum(EWebAppType)
  webAppType: EWebAppType;

  @ApiProperty()
  @IsString()
  deviceId: string;

  @ApiProperty()
  @IsDate()
  date: Date;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  language?: string;
}
