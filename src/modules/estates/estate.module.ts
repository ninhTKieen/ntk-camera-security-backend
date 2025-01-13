import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Area } from 'src/entities/area.entity';
import { Device } from 'src/entities/device.entity';
import { EstateMember } from 'src/entities/estate-member.entity';
import { Estate } from 'src/entities/estate.entity';
import { RecognizedFace } from 'src/entities/recognized-face.entity';
import { Relay } from 'src/entities/relay.entity';

import { DevicesModule } from '../devices/devices.module';
import { ImageModule } from '../image/image.module';
import { RelayModule } from '../relays/relay.module';
import { UsersModule } from '../users/users.module';
import { AdminEstateController } from './admin-estate.controller';
import { AdminEstateService } from './admin-estate.service';
import { EstateController } from './estate.controller';
import { EstateService } from './estate.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Estate,
      EstateMember,
      Area,
      Device,
      RecognizedFace,
      Relay,
    ]),
    forwardRef(() => ImageModule),
    forwardRef(() => UsersModule),
    forwardRef(() => DevicesModule),
    forwardRef(() => RelayModule),
  ],
  controllers: [EstateController, AdminEstateController],
  providers: [EstateService, AdminEstateService],
  exports: [EstateService],
})
export class EstateModule {}
