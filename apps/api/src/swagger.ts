import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('EZ Movie API')
    .setDescription('Professional movie streaming platform API')
    .setVersion('1.0')
    .addCookieAuth('refreshToken')
    .addBearerAuth()
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/docs', app, document, { 
    jsonDocumentUrl: '/openapi.json',
    customSiteTitle: 'EZ Movie API Documentation',
    customfavIcon: '/cdn/brand/favicon.ico',
    customCss: `
      .topbar-wrapper img { content: url('/cdn/brand/logo-light.svg'); width: 120px; height: auto; }
      .swagger-ui .topbar { background-color: #0a0c12; }
    `
  });
}
