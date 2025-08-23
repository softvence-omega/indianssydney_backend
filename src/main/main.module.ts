import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { SubscribeModule } from './subscribe/subscribe.module';

@Module({
  imports: [AuthModule, UserModule, SubscribeModule],
  controllers: [],
  providers: [],
})
export class MainModule {}
