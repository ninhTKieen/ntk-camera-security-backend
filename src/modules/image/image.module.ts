import { Module } from '@nestjs/common';

import { AdminImageController } from './admin-image.controller';
import { ImageController } from './image.controller';
import { ImageProvider } from './image.provider';
import { ImageService } from './image.service';

@Module({
  imports: [],
  controllers: [ImageController, AdminImageController],
  providers: [ImageService, ImageProvider],
  exports: [ImageService, ImageProvider],
})
export class ImageModule {}
