import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { welcome } from '../welcome';
import { INestApplication, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /* Enable CORS */
  app.enableCors({
    origin: process.env.APP_ROUTE, // Permitir solicitudes desde Next.js
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true, // Si usas cookies o autenticación
  });
  /* Enable CORS */

  setGlobalModifiers(app);
  await app.listen(process.env.PORT ?? 3000);
  welcome();
}

void bootstrap();

const setGlobalModifiers = (appModule: INestApplication) => {
  appModule.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
};
