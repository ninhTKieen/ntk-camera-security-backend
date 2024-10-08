import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstateMember } from 'src/entities/estate-member.entity';
import { Estate } from 'src/entities/estate.entity';

import { ImageModule } from '../image/image.module';
import { UsersModule } from '../users/users.module';
import { EstateController } from './estate.controller';
import { EstateService } from './estate.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Estate, EstateMember]),
    forwardRef(() => ImageModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [EstateController],
  providers: [EstateService],
  exports: [EstateService],
})
export class EstateModule {}
