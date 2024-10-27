import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
      whitelist: true, // Supprime les propriétés non définies dans les DTOs
      transform: true, // Transforme automatiquement les types
      forbidNonWhitelisted: true, // Rejette les requêtes avec des propriétés non définies
    })
  )
  await app.listen(process.env.PORT ?? 3000); 
}
bootstrap();
