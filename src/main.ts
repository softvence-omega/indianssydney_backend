import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ENVEnum } from './common/enum/env.enum';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filter/http-exception.filter';
import * as bodyParser from 'body-parser';
import { credential } from 'firebase-admin';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --------------Swagger config with Bearer Auth------------------
  const config = new DocumentBuilder()
    .setTitle('indianssydney backend')
    .setDescription('Team indianssydney API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const allowedOrigins = [
    'https://the-australian-canvas.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
    'https://api.australiancanvas.com',
    'https://australiancanvas.com',
    'http://localhost:5000',
  ];

  app.enableCors({
    origin: allowedOrigins || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: '*',
    exposedHeaders: '*',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());
  // --------swagger api----

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  // ---------------webhook raw body parser----------------
  // Stripe requires the raw body to construct the event.
  app.use('/stripe/webhook', bodyParser.raw({ type: 'application/json' }));
  const configService = app.get(ConfigService);
  const port = parseInt(configService.get<string>(ENVEnum.PORT) ?? '5000', 10);
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📑 Swagger docs available at http://localhost:${port}/docs`);
}
bootstrap();
