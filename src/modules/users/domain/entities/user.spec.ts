import { Role } from './role';
import { User } from './user';

describe('User Entity', () => {
  it('should create a user with all properties', () => {
    const userData = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'hashedpassword123',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      role: Role.create({
        id: 2,
        name: 'User',
      }),
    };

    const user = User.create(userData);

    expect(user.id).toBe(userData.id);
    expect(user.name).toBe(userData.name);
    expect(user.email).toBe(userData.email);
    expect(user.password).toBe(userData.password);
    expect(user.isActive).toBe(userData.isActive);
    expect(user.createdAt).toBe(userData.createdAt);
    expect(user.updatedAt).toBe(userData.updatedAt);
    expect(user.role.id).toBe(userData.role.id);
    expect(user.role.name).toBe(userData.role.name);
  });

  it('should create a user without id (for new users)', () => {
    const userData = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'hashedpassword123',
      isActive: true,
      role: Role.create({ id: 2, name: 'User' }),
    };

    const user = User.create(userData);

    expect(user.id).toBeUndefined();
    expect(user.name).toBe(userData.name);
    expect(user.email).toBe(userData.email);
    expect(user.password).toBe(userData.password);
    expect(user.isActive).toBe(userData.isActive);
    expect(user.role.id).toBe(userData.role.id);
    expect(user.role.name).toBe(userData.role.name);
  });

  it('should return user data without password when calling toResponse()', () => {
    const userData = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'hashedpassword123',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      role: Role.create({ id: 2, name: 'User' }),
    };
    const user = User.create(userData);

    const response = user.toResponse();

    expect(response).not.toHaveProperty('password');
    expect(response).toEqual({
      id: userData.id,
      name: userData.name,
      email: userData.email,
      isActive: userData.isActive,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
      role: {
        id: userData.role.id,
        name: userData.role.name,
      },
    });
  });
});
