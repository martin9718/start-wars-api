import { User } from '../domain/entities/user';
import { Role } from '../domain/entities/role';
import { ROLES } from '../domain/types';

export class UserFactory {
  static createDefaultUsers(): User[] {
    return [
      User.create({
        id: '1',
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'hashedpassword',
        isActive: true,
        role: Role.create(ROLES.ADMIN),
      }),
      User.create({
        id: '2',
        name: 'Regular User',
        email: 'user@example.com',
        password: 'hashedpassword',
        isActive: true,
        role: Role.create(ROLES.USER),
      }),
    ];
  }

  static createAdminUser(
    overrides: Partial<Parameters<typeof User.create>[0]> = {},
  ): User {
    return User.create({
      id: '1',
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'hashedpassword',
      isActive: true,
      role: Role.create(ROLES.ADMIN),
      ...overrides,
    });
  }

  static createRegularUser(
    overrides: Partial<Parameters<typeof User.create>[0]> = {},
  ): User {
    return User.create({
      id: '2',
      name: 'Regular User',
      email: 'user@example.com',
      password: 'hashedpassword',
      isActive: true,
      role: Role.create(ROLES.USER),
      ...overrides,
    });
  }

  static createUserModels(): Array<Record<string, unknown>> {
    return [
      {
        id: '1',
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'hashedpassword',
        is_active: true,
        role_id: ROLES.ADMIN.id,
      },
      {
        id: '2',
        name: 'Regular User',
        email: 'user@example.com',
        password: 'hashedpassword',
        is_active: true,
        role_id: ROLES.USER.id,
      },
    ];
  }
}
