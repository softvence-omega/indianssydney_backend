import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { LibModule } from './lib/lib.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LibModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
