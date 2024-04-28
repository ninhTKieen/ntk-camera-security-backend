import { Module } from '@nestjs/common';

import { ImageController } from './image.controller';
import { ImageProvider } from './image.provider';
import { ImageService } from './image.service';

@Module({
  imports: [],
  controllers: [ImageController],
  providers: [ImageService, ImageProvider],
  exports: [ImageService, ImageProvider],
})
export class ImageModule {}
