import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';
import { GetPaginatedDto } from 'src/common/get-paginated.dto';

export class AdminGetListRelayDto extends GetPaginatedDto {
  @IsNumber()
  @Type(() => Number)
  @ApiProperty({ required: false })
  estateId: number;

  @IsString()
  @Type(() => String)
  estateName: string;
}
