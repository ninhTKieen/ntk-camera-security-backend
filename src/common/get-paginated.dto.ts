import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

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
}
