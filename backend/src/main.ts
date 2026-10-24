import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefijo para que las rutas sean /api/...
  app.setGlobalPrefix('api');

  // Lectura de cookies
  app.use(cookieParser());

  // Validación automática de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Permitir peticiones desde Next.js con cookies
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Notes API')
    .setDescription('API REST de gestion de notas y recordatorios')
    .setVersion('1.0')
    .addTag('auth', 'Autenticacion y sesiones')
    .addTag('notes', 'Operaciones con notas de usuario')
    .addCookieAuth('session')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(3001);
}
bootstrap();
