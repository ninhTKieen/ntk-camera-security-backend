import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';
import { GetPaginatedDto } from 'src/common/get-paginated.dto';

export class GetListRelayDto extends GetPaginatedDto {
  @IsNumber()
  @Type(() => Number)
  @ApiProperty()
  estateId: number;

  @IsString()
  @Type(() => String)
  estateName: string;
}
