import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { AuthGoogleService } from './services/auth-google.service';
import { LibModule } from 'src/lib/lib.module';

@Module({
  imports: [LibModule],
  controllers: [AuthController],
  providers: [AuthService, AuthGoogleService],
})
export class AuthModule {}
