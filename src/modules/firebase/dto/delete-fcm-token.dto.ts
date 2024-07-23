import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteFcmTokenDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  deviceId: string;
}
