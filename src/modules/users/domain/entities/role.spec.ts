import { Role } from './role';

describe('Role Entity', () => {
  it('should create a role with valid properties', () => {
    const roleProps = {
      id: 1,
      name: 'Admin',
    };

    const role = Role.create(roleProps);

    expect(role).toBeDefined();
    expect(role.id).toBe(1);
    expect(role.name).toBe('Admin');
  });

  it('should create distinct instances for different roles', () => {
    const adminRole = Role.create({ id: 1, name: 'Admin' });
    const userRole = Role.create({ id: 2, name: 'User' });

    expect(adminRole).not.toBe(userRole);
    expect(adminRole.id).not.toBe(userRole.id);
    expect(adminRole.name).not.toBe(userRole.name);
  });
});
