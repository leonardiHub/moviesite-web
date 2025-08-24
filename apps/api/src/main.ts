import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('v1');

  // Security middleware
  app.use(helmet());
  app.use(compression());
  app.use(rateLimit({
    windowMs: 60_000, // 1 minute
    max: 300, // limit each IP to 300 requests per windowMs
  }));

  // CORS
  app.enableCors({
    origin: [/localhost:\d+$/, /\.your-domain\.com$/],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false, // 改为false，允许额外字段
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 记录真实客户端IP（如走代理/CDN）
  const httpAdapter = app.getHttpAdapter();
  if (httpAdapter && httpAdapter.getInstance) {
    httpAdapter.getInstance().set('trust proxy', 1);
  }

  // Temporary CDN for development
  app.use('/cdn', express.static(join(__dirname, '..', 'public', 'cdn'), { 
    maxAge: '30d',
    setHeaders: (res, path) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
  }));

  // Setup Swagger documentation
  setupSwagger(app);

  const port = process.env.PORT || 4000;
  await app.listen(port);
  
  console.log(`🚀 EZ Movie API is running on: http://localhost:${port}/v1`);
  console.log(`📚 API Documentation: http://localhost:${port}/docs`);
  console.log(`🗂️ OpenAPI JSON: http://localhost:${port}/openapi.json`);
}

bootstrap();
