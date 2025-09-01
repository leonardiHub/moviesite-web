import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { setupSwagger } from "./swagger";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { Request, Response, NextFunction } from "express";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix("v1");

  // Security middleware with custom CSP for images
  // Temporarily disabled Helmet to fix cross-origin blocking
  /*
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          baseUri: ["'self'"],
          fontSrc: ["'self'", "https:", "data:"],
          formAction: ["'self'"],
          frameAncestors: ["'self'"],
          imgSrc: ["'self'", "data:", "*"], // Allow images from any source
          objectSrc: ["'none'"],
          scriptSrc: ["'self'"],
          scriptSrcAttr: ["'none'"],
          styleSrc: ["'self'", "https:", "'unsafe-inline'"],
          upgradeInsecureRequests: [],
        },
      },
      crossOriginResourcePolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: false,
    })
  );
  */
  app.use(compression());
  app.use(
    rateLimit({
      windowMs: 60_000, // 1 minute
      max: 300, // limit each IP to 300 requests per windowMs
    })
  );

  // CORS - Completely open for all origins
  app.enableCors({
    origin: true, // Allow all origins
    credentials: true, // Allow credentials
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
    allowedHeaders: ["*"], // Allow all headers
    exposedHeaders: ["*"], // Expose all headers
    preflightContinue: false,
    optionsSuccessStatus: 204
  });

  // Handle preflight requests - completely permissive
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Set CORS headers for all requests
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD");
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Expose-Headers", "*");
    res.header("Access-Control-Max-Age", "86400");

    // Set cross-origin resource policy headers
    res.header("Cross-Origin-Resource-Policy", "cross-origin");
    res.header("Cross-Origin-Embedder-Policy", "unsafe-none");
    res.header("Cross-Origin-Opener-Policy", "same-origin-allow-popups");

    if (req.method === "OPTIONS") {
      res.status(200).end();
      return;
    }
    next();
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
    })
  );

  // 记录真实客户端IP（如走代理/CDN）
  const httpAdapter = app.getHttpAdapter();
  if (httpAdapter && httpAdapter.getInstance) {
    httpAdapter.getInstance().set("trust proxy", 1);
  }

  // Setup Swagger documentation
  setupSwagger(app);

  const port = process.env.PORT || 4000;
  const host = '0.0.0.0'; // Bind to all interfaces
  
  await app.listen(port, host);

  console.log(`🚀 EZ Movie API is running on: http://${host}:${port}/v1`);
  console.log(`🚀 EZ Movie API is running on: http://51.79.254.237:${port}/v1`);
  console.log(`📚 API Documentation: http://51.79.254.237:${port}/docs`);
  console.log(`🗂️ OpenAPI JSON: http://51.79.254.237:${port}/openapi.json`);
}

bootstrap();
