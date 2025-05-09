import { Role } from './role';

export interface UserProperties {
  id?: string;
  name: string;
  email: string;
  password: string;
  isActive: boolean;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  private constructor(
    readonly name: string,
    readonly email: string,
    readonly password: string,
    readonly isActive: boolean,
    readonly role: Role,
    readonly createdAt: Date,
    readonly updatedAt: Date,
    readonly id?: string,
  ) {}

  static create(props: {
    name: string;
    email: string;
    password: string;
    isActive: boolean;
    role: Role;
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }): User {
    const now = new Date();

    return new User(
      props.name,
      props.email,
      props.password,
      props.isActive,
      props.role,
      props.createdAt || now,
      props.updatedAt || now,
      props.id,
    );
  }

  hasRole(roleName: string): boolean {
    return this.role.name.toLowerCase() === roleName.toLowerCase();
  }

  toResponse(): Omit<UserProperties, 'password'> {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      isActive: this.isActive,
      role: this.role,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
