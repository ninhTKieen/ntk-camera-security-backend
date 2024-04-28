import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export function GetAllResponseDto<T>(itemType: new () => T) {
  class GetAllResponse {
    @ApiProperty({ type: [itemType] })
    data: T[];

    @ApiProperty({ example: HttpStatus.OK })
    code: number;

    @ApiProperty({ example: 'Success' })
    message: string;
  }

  return GetAllResponse;
}
