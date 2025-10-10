import { Injectable, NotFoundException } from '@nestjs/common';
import { HandleError } from 'src/common/error/handle-error.decorator';
import { PrismaService } from 'src/lib/prisma/prisma.service';
import { UserRoleEnum } from '../dto/change-role.dto';

@Injectable()
export class UsermanageService {
  constructor(private readonly prisma: PrismaService) {}

  @HandleError('super admin can be deactive user')
  async deactivateUser(id: string, isActive: boolean) {
    const user = await this.prisma.user.update({
      where: { id },
      data: { isActive },
    });
    if (!user) throw new NotFoundException('User not found');
    return { message: `User ${isActive ? 'activated' : 'deactivated'}`, user };
  }

  // ----------------deleted----------------------
  @HandleError('super admin can be soft deleted user')
  async softDeleteUser(id: string) {
    const user = await this.prisma.user.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });
    if (!user) throw new NotFoundException('User not found');
    return { message: 'User soft deleted', user };
  }

  // ---------------- super admin status chnage-----------------------
  async changeUserRole(id: string, role: UserRoleEnum) {
    const user = await this.prisma.user.update({
      where: { id },
      data: { role },
    });
    if (!user) throw new NotFoundException('User not found');
    return { message: `User role changed to ${role}`, user };
  }
}
