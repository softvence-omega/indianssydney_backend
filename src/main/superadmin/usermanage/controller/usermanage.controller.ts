import { Controller, Body, Param, Delete, Patch } from '@nestjs/common';
import { UsermanageService } from '../service/usermanage.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ValidateSuperAdmin } from 'src/common/jwt/jwt.decorator';
import { ChangeRoleDto } from '../dto/change-role.dto';
import { DeactivateDto } from '../dto/deactivate.dto';
@ApiTags('User Management (Super Admin Only)')
@Controller('usermanage/superadmin')
export class UsermanageController {
  constructor(private readonly usermanageService: UsermanageService) {}

  @ApiOperation({ summary: 'Super Admin deactivate/activate user' })
  @ApiBearerAuth()
  @ValidateSuperAdmin()
  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string, @Body() dto: DeactivateDto) {
    return this.usermanageService.deactivateUser(id, dto.isActive);
  }

  @ApiOperation({ summary: 'Soft delete a user (isDeleted=true)' })
  @ApiBearerAuth()
  @ValidateSuperAdmin()
  @Delete(':id')
  softDelete(@Param('id') id: string) {
    return this.usermanageService.softDeleteUser(id);
  }

  @ApiOperation({ summary: 'Change user role' })
  @ApiBearerAuth()
  @ValidateSuperAdmin()
  @Patch(':id/role')
  changeRole(@Param('id') id: string, @Body() dto: ChangeRoleDto) {
    return this.usermanageService.changeUserRole(id, dto.role);
  }
}
