import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { EEstateRole } from 'src/common/common.enum';

export class AddMemberDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  role: EEstateRole;

  @ApiProperty({ required: false })
  @IsString()
  nickname?: string;
}
