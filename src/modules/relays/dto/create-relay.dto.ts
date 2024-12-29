import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateRelayDto {
  @ApiProperty({ example: 'Main Gate Relay' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'Controls main gate access', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;

  @ApiProperty({ example: '192.168.1.100', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  ipAddress?: string;

  @ApiProperty({ example: '8080', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  port?: string;

  @ApiProperty({ example: 'AA:BB:CC:DD:EE:FF' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  uid: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  estateId: number;
}
