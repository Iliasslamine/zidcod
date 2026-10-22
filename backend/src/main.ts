import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Helmet: Secure HTTP headers
  app.use(helmet());

  // 2. CORS: Cross-Origin Resource Sharing with full network access
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 3. Global Validation Pipe: Strip malicious/unwanted data
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strips out properties that don't have decorators
      forbidNonWhitelisted: true, // Throws an error if non-whitelisted properties exist
      transform: true, // Automatically transforms payloads to DTO instances
    }),
  );

  // Increase payload limit to allow Base64 image uploads
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');
  console.log(`Backend is running on http://0.0.0.0:${port} and http://127.0.0.1:${port}`);
}
await bootstrap();

