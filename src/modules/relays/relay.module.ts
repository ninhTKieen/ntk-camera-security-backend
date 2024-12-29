import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Relay } from 'src/entities/relay.entity';
import { EstateModule } from 'src/modules/estates/estate.module';

import { AdminRelaysController } from './admin-relay.controller';
import { RelaysController } from './relay.controller';
import { RelayService } from './relay.service';

@Module({
  imports: [TypeOrmModule.forFeature([Relay]), forwardRef(() => EstateModule)],
  controllers: [RelaysController, AdminRelaysController],
  providers: [RelayService],
})
export class RelayModule {}
