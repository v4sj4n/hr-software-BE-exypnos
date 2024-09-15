import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService: ConfigService = app.get(ConfigService);

  const adminConfig: ServiceAccount = {
    projectId: configService.get<string>('FIREBASE_PROJECT_ID'),
    privateKey: configService
      .get<string>('FIREBASE_PRIVATE_KEY')
      .replace(/\\n/g, '\n'),
    clientEmail: configService.get<string>('FIREBASE_CLIENT_EMAIL'),
  };

  admin.initializeApp({
    credential: admin.credential.cert(adminConfig),
    databaseURL: `https://${configService.get<string>('FIREBASE_PROJECT_ID')}.firebaseio.com`,
  });

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'DELETE', 'PATCH', 'PUT'],
    // credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const microservice = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'chat',
      protoPath: join(__dirname, '../proto/chat.proto'), // Points to the root directory
      url: 'localhost:5000', // Change the gRPC port if necessary
    },
  });

  await app.listen(5000);
  await app.startAllMicroservices();
}
bootstrap();
