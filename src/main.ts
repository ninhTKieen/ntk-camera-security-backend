import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as bodyParser from 'body-parser';

import { TAppConfig } from './configs/app.config';
import { AppModule } from './modules/app/app.module';
import { setupSwagger } from './setup/swagger.setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger();
  const configService = app.get(ConfigService);

  app.enableCors();
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  setupSwagger({
    app,
    title: 'API Documents',
    prefix: configService.get('apiPrefix'),
  });

  const port = configService.getOrThrow<TAppConfig>('app').port;
  await app.listen(port, () => {
    logger.log(`Server is running on http://localhost:${port}`);
  });
}
bootstrap();
