import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';
import { GetPaginatedDto } from 'src/common/get-paginated.dto';

export class GetListDeviceDto extends GetPaginatedDto {
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @ApiProperty({ required: false })
  areaId?: number;

  @IsNumber()
  @Type(() => Number)
  @ApiProperty()
  estateId: number;
}
