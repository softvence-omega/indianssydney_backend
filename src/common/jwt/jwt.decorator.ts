import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { UserEnum } from '../enum/user.enum';

import { RequestWithUser } from './jwt.interface';
import { JwtAuthGuard, RolesGuard } from './jwt.gurd';

export const ROLES_KEY = 'roles';
export const IS_PUBLIC_KEY = 'isPublic';
export const Roles = (...roles: UserEnum[]) => SetMetadata(ROLES_KEY, roles);

export function MakePublic() {
  return SetMetadata(IS_PUBLIC_KEY, true);
}

export const GetUser = createParamDecorator(
  (key: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    return key ? user?.[key] : user;
  },
);

export function ValidateAuth(...roles: UserEnum[]) {
  const decorators = [UseGuards(JwtAuthGuard, RolesGuard)];
  if (roles.length > 0) {
    decorators.push(Roles(...roles));
  }
  return applyDecorators(...decorators);
}

export function ValidateSuperAdmin() {
  return ValidateAuth(UserEnum.SUPER_ADMIN);
}

export function ValidateContibutor() {
  return ValidateAuth(UserEnum.CONTIBUTOR, UserEnum.SUPER_ADMIN);
}

export function ValidateAdmin() {
  return ValidateAuth(UserEnum.ADMIN, UserEnum.SUPER_ADMIN);
}
export function ValidateMember() {
  return ValidateAuth(UserEnum.MEMBER, UserEnum.SUPER_ADMIN);
}

export function ValidateUser() {
  return ValidateAuth(
    UserEnum.USER,
    UserEnum.SUPER_ADMIN,
    UserEnum.MEMBER,
    UserEnum.ADMIN,
    UserEnum.CONTIBUTOR,
  );
}
