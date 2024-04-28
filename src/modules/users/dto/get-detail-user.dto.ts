import { ApiProperty } from '@nestjs/swagger';
import { ERole } from 'src/common/common.enum';

export class GetDetailUserDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'john_doe' })
  username: string;

  @ApiProperty({ example: '01234567890', nullable: true })
  phoneNumber: string;

  @ApiProperty({ example: 'http://example.com/image.jpg', nullable: true })
  imageUrl: string | null;

  @ApiProperty({ example: 'male', nullable: true })
  gender: string | null;

  @ApiProperty({ example: '1990-01-01', nullable: true })
  dateOfBirth: Date | null;

  @ApiProperty({ example: ERole.USER })
  role: ERole;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  createdById?: number;

  @ApiProperty()
  updatedAt?: Date;

  @ApiProperty()
  updatedById?: number;

  @ApiProperty()
  deletedAt?: Date;

  @ApiProperty()
  deletedById?: number;
}
