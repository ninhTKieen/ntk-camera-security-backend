import { ApiProperty } from '@nestjs/swagger';

export class UploadImageResponseDto {
  @ApiProperty()
  imagePublicId: string;

  @ApiProperty()
  imagePublicUrl: string;

  @ApiProperty()
  imageSecureUrl: string;

  @ApiProperty()
  width: number;

  @ApiProperty()
  height: number;

  @ApiProperty()
  format: string;
}

export class UploadImagesResponseDto {
  @ApiProperty()
  images: UploadImageResponseDto[];
}
