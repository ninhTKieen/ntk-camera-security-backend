import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

import { EOrder } from './common.enum';

export class GetPaginatedDto {
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @ApiProperty({
    type: Number,
    default: 10,
  })
  limit: number = 10;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @ApiProperty({
    type: Number,
    default: 1,
  })
  page: number = 1;

  @IsString()
  @IsOptional()
  @Type(() => String)
  @ApiProperty({
    type: String,
    default: '',
    required: false,
  })
  search?: string = '';

  @IsString()
  @IsOptional()
  @Type(() => String)
  @ApiProperty({
    type: String,
    default: '',
    required: false,
  })
  sort?: string = '';

  @IsString()
  @IsOptional()
  @ApiProperty({
    type: String,
    default: 'ASC',
    required: false,
    enum: EOrder,
  })
  order?: EOrder = EOrder.ASC;
}
