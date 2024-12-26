import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray } from 'class-validator';

import { AdminAddMemberDto } from './add-member.dto';
import { CreateEstateDto } from './create-estate.dto';

export class AdminCreateEstateDto extends CreateEstateDto {
  @ApiProperty({
    description: 'Members of the estate',
    type: [AdminAddMemberDto],
  })
  @IsArray()
  @Type(() => AdminAddMemberDto)
  members: AdminAddMemberDto[];
}
