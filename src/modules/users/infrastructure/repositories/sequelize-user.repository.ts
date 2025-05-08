import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository';
import { InjectModel } from '@nestjs/sequelize';
import { UserModel } from '../../../shared/infrastructure/database/models/user.model';
import { RoleModel } from '../../../shared/infrastructure/database/models/role.model';
import { User } from '../../domain/entities/user';
import { Role } from '../../domain/entities/role';
import { DatabaseError } from '../../../shared/infrastructure/database/errors/database-error';

@Injectable()
export class SequelizeUserRepository implements UserRepository {
  constructor(
    @InjectModel(UserModel)
    private readonly userModel: typeof UserModel,
    @InjectModel(RoleModel)
    private readonly roleModel: typeof RoleModel,
  ) {}

  async create(user: User): Promise<User> {
    try {
      const newUser = await this.userModel.create({
        name: user.name,
        email: user.email,
        password: user.password,
        role_id: user.role.id,
      });

      const createdUser = await this.findById(newUser.id);

      if (!createdUser) {
        throw new DatabaseError(
          `User with id ${newUser.id} was not found after creation`,
        );
      }

      return createdUser;
    } catch (error) {
      throw new DatabaseError(error);
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      const user = await this.userModel.findOne({
        where: { id },
        include: [
          {
            model: this.roleModel,
          },
        ],
      });

      return user ? this.buildUserEntity(user) : null;
    } catch (error) {
      throw new DatabaseError(error);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await this.userModel.findOne({
        where: { email },
        include: [
          {
            model: this.roleModel,
          },
        ],
      });

      return user ? this.buildUserEntity(user) : null;
    } catch (error) {
      throw new DatabaseError(error);
    }
  }

  private buildUserEntity(model: UserModel): User {
    return User.create({
      id: model.id,
      name: model.name,
      email: model.email,
      password: model.password,
      isActive: model.is_active,
      createdAt: model.created_at,
      updatedAt: model.updated_at,
      role: Role.create({
        id: model.role.id,
        name: model.role.name,
      }),
    });
  }
}
