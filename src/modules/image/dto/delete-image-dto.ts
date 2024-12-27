import { ApiProperty } from '@nestjs/swagger';

export class DeleteImageDto {
  @ApiProperty()
  publicId: string;
}
