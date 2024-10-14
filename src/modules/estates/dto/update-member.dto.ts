import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { EEstateRole } from 'src/entities/estate-member.entity';

export class UpdateMemberDto {
  @ApiProperty({ required: false })
  @IsString()
  role: EEstateRole;

  @ApiProperty({ required: false })
  @IsString()
  nickname: string;
}
