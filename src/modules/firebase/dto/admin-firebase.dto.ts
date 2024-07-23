import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class NotificationDto {
  @ApiProperty({ description: 'The title of the notification' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: 'The body of the notification' })
  @IsString()
  @IsOptional()
  body?: string;

  @ApiProperty({ description: 'The image URL for the notification' })
  @IsString()
  @IsOptional()
  imageUrl?: string;
}

export class SendNotificationDto {
  @ApiProperty()
  @IsNotEmpty()
  tokens: string[];

  @ApiProperty({ type: NotificationDto })
  @ValidateNested()
  @Type(() => NotificationDto)
  @IsNotEmpty()
  notification: NotificationDto;

  @ApiProperty({ type: 'object', required: false })
  @IsOptional()
  data?: {
    [key: string]: string;
  };
}

export class SendOneNotificationDto {
  @ApiProperty({ type: NotificationDto })
  @ValidateNested()
  @Type(() => NotificationDto)
  @IsNotEmpty()
  notification: NotificationDto;

  @ApiProperty({ type: 'object', required: false })
  @IsOptional()
  data?: {
    [key: string]: string;
  };
}
