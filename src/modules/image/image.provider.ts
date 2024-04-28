import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { IAppConfig } from 'src/configs/app.config';

export const ImageProvider = {
  provide: 'CLOUDINARY',
  useFactory: async (configService: ConfigService<IAppConfig>) => {
    return cloudinary.config({
      cloud_name: configService.get('cloudinaryCloudName'),
      api_key: configService.get('cloudinaryApiKey'),
      api_secret: configService.get('cloudinaryApiSecret'),
    });
  },
  inject: [ConfigService],
};
