import { ApiProperty } from '@nestjs/swagger';

export class GetRecognizedFaceDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty()
  faceEncoding: string;

  @ApiProperty({ required: false })
  imageUrl?: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
