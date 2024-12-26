import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsNumber } from 'class-validator';

export class DeleteManyUserDto {
  @ApiProperty({
    type: [Number],
    example: [1, 2, 3],
    description: 'Array of user IDs to delete',
  })
  @IsArray({ message: 'ids must be an array' })
  @ArrayNotEmpty({ message: 'ids should not be empty' })
  @IsNumber({}, { each: true, message: 'each value in ids must be a number' })
  @Type(() => Number)
  ids: number[];
}
