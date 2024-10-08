import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { EEstateType } from 'src/common/common.enum';

export class CreateEstateDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: EEstateType })
  @IsNotEmpty()
  @IsEnum(EEstateType)
  type: EEstateType;

  @ApiProperty({ type: [String], description: 'Array of image URLs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];

  @ApiProperty({ type: [Number], description: 'Array of image URL IDs' })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  imageUrlIds?: number[];

  @ApiProperty({ description: 'Longitude of the estate' })
  @IsOptional()
  @IsNumber()
  long?: number;

  @ApiProperty({ description: 'Latitude of the estate' })
  @IsOptional()
  @IsNumber()
  lat?: number;

  @ApiProperty({ description: 'Address of the estate' })
  @IsOptional()
  @IsString()
  address?: string;
}
