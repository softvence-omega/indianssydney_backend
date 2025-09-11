import { Module } from '@nestjs/common';
import { AdminManagementService } from './service/admin-management.service';
import { AdminManagementController } from './controller/admin-management.controller';

@Module({
  controllers: [AdminManagementController],
  providers: [AdminManagementService],
})
export class AdminManagementModule {}
