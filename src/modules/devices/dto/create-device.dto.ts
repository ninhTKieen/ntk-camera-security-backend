import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateDeviceDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  streamLink: string;

  @ApiProperty()
  @IsNumber()
  estateId: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  areaId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  rtsp: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  model: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  serial: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  brand: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  mac: string;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  faceRecognitionEnabled: boolean;
}
