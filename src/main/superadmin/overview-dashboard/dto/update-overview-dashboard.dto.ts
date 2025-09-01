import { PartialType } from '@nestjs/swagger';
import { CreateOverviewDashboardDto } from './create-overview-dashboard.dto';

export class UpdateOverviewDashboardDto extends PartialType(CreateOverviewDashboardDto) {}
