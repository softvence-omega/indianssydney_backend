import { Module } from '@nestjs/common';

import * as admin from 'firebase-admin';
import { NotificationController } from './controller/notification.controller';
import { PrismaService } from 'src/lib/prisma/prisma.service';
import { NotificationService } from './service/notification.service';
import { ConfigService } from '@nestjs/config';


@Module({
  controllers: [NotificationController],
  providers: [
    PrismaService,
    NotificationService,
    {
      provide: 'FIREBASE_ADMIN',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return admin.initializeApp({
          credential: admin.credential.cert({
            projectId: configService.get<string>('FIREBASE_PROJECT_ID'),
            clientEmail: configService.get<string>('FIREBASE_CLIENT_EMAIL'),
            privateKey: configService
              .get<string>('FIREBASE_PRIVATE_KEY')
              ?.replace(/\\n/g, '\n'),
          }),
        });
      },
    },
  ],
  exports: [NotificationService],
})
export class NotificationModule {}