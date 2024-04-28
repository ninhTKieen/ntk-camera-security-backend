import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

interface ISwaggerSetup {
  app: INestApplication;
  prefix: string;
  title?: string;
  description?: string;
  version?: string;
  path?: string;
}

export const setupSwagger = ({
  app,
  prefix = 'api',
  title = 'API documents',
  description = '',
  version = '1.0',
  path = '/docs',
}: ISwaggerSetup): void => {
  const config = new DocumentBuilder()
    .setTitle(title)
    .setDescription(description)
    .setVersion(version)
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter access token',
        in: 'header',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup(prefix + path, app, document);
};
