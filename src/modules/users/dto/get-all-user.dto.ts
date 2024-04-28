import { ApiProperty } from '@nestjs/swagger';
import { EGender, ERole } from 'src/common/common.enum';

export class GetAllUserDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: 'john_doe' })
  username: string;

  @ApiProperty({ example: '1234567890' })
  phoneNumber: string;

  @ApiProperty({ example: 'http://example.com/image.jpg', nullable: true })
  imageUrl: string | null;

  @ApiProperty({ example: '1234567890', nullable: true })
  imageUrlId: string;

  @ApiProperty({ example: 'male', nullable: true })
  gender: EGender | null;

  @ApiProperty({ example: '1990-01-01', nullable: true })
  dateOfBirth: Date | null;

  @ApiProperty({ example: ERole.USER })
  role: ERole;
}
