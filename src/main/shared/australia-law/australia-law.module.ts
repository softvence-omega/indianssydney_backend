import { Module } from '@nestjs/common';
import { AustraliaLawService } from './service/australia-law.service';
import { AustraliaLawController } from './controller/australia-law.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [AustraliaLawController],
  providers: [AustraliaLawService],
})
export class AustraliaLawModule {}
