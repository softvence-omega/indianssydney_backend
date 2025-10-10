import { PartialType } from '@nestjs/swagger';
import { CreateAdminDashboardDto } from './create-admin-dashboard.dto';

export class UpdateAdminDashboardDto extends PartialType(CreateAdminDashboardDto) {}
