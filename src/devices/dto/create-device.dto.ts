import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateDeviceDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  ipCamera: string;

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
}
