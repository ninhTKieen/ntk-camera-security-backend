import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { EEstateRole } from 'src/entities/estate-member.entity';

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
