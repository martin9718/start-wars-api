export const ROLES = {
  ADMIN: {
    id: 1,
    name: 'Admin',
  },
  USER: {
    id: 2,
    name: 'User',
  },
} as const;

export type RoleId = (typeof ROLES)['ADMIN' | 'USER']['id'];

export const validRoleIds = [ROLES.ADMIN.id, ROLES.USER.id];
