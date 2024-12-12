import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { EEstateMemberStatus, EEstateType } from 'src/common/common.enum';
import { GetPaginatedDto } from 'src/common/get-paginated.dto';
import { EstateMember } from 'src/entities/estate-member.entity';

export class GetAllEstateDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Estate Name' })
  name: string;

  @ApiProperty({ example: 'Estate Description' })
  description: string;

  @ApiProperty({ example: EEstateType.APARTMENT })
  type: EEstateType;

  @ApiProperty({ example: ['http://example.com/image.jpg'] })
  imageUrls: string[];

  @ApiProperty({ example: [1] })
  imageUrlIds: string[];

  @ApiProperty({ example: 1 })
  long: number;

  @ApiProperty({ example: 1 })
  lat: number;

  @ApiProperty({ example: 'Estate Address' })
  address: string;

  @ApiProperty({ example: [] })
  members: EstateMember[];
}

export class GetAllEstateParams extends GetPaginatedDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    type: String,
    default: '',
    required: false,
    enum: EEstateMemberStatus,
  })
  status?: EEstateMemberStatus;
}
