import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { TConfigs } from 'src/configs';
import { TAppConfig } from 'src/configs/app.config';

export const ImageProvider = {
  provide: 'CLOUDINARY',
  useFactory: async (configService: ConfigService<TConfigs>) => {
    return cloudinary.config({
      cloud_name:
        configService.getOrThrow<TAppConfig>('app').cloudinaryCloudName,
      api_key: configService.getOrThrow<TAppConfig>('app').cloudinaryApiKey,
      api_secret:
        configService.getOrThrow<TAppConfig>('app').cloudinaryApiSecret,
    });
  },
  inject: [ConfigService],
};
