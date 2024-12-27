import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Device } from 'src/entities/device.entity';
import { EstateModule } from 'src/modules/estates/estate.module';

import { ImageModule } from '../image/image.module';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Device]),
    forwardRef(() => EstateModule),
    forwardRef(() => ImageModule),
  ],
  controllers: [DevicesController],
  providers: [DevicesService],
})
export class DevicesModule {}
