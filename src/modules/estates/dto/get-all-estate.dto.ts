import { ApiProperty } from '@nestjs/swagger';

export class GetAllEstateDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Estate Name' })
  name: string;

  @ApiProperty({ example: 'Estate Description' })
  description: string;

  @ApiProperty({ example: ['http://example.com/image.jpg'] })
  imageUrls: string[];

  @ApiProperty({ example: [1] })
  imageUrlIds: number[];

  @ApiProperty({ example: 1 })
  long: number;

  @ApiProperty({ example: 1 })
  lat: number;

  @ApiProperty({ example: 'Estate Address' })
  address: string;
}
