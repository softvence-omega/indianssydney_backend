import { Injectable } from '@nestjs/common';
import { CreateAdminDashboardDto } from './dto/create-admin-dashboard.dto';
import { UpdateAdminDashboardDto } from './dto/update-admin-dashboard.dto';

@Injectable()
export class AdminDashboardService {
  create(createAdminDashboardDto: CreateAdminDashboardDto) {
    return 'This action adds a new adminDashboard';
  }

  findAll() {
    return `This action returns all adminDashboard`;
  }

  findOne(id: number) {
    return `This action returns a #${id} adminDashboard`;
  }

  update(id: number, updateAdminDashboardDto: UpdateAdminDashboardDto) {
    return `This action updates a #${id} adminDashboard`;
  }

  remove(id: number) {
    return `This action removes a #${id} adminDashboard`;
  }
}
