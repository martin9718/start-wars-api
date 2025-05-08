import { Module } from '@nestjs/common';
import { UserRepository } from './domain/repositories/user.repository';
import { SequelizeUserRepository } from './infrastructure/repositories/sequelize-user.repository';
import { CreateUserUseCase } from './application/use-cases/create-user/create-user.use-case';
import { CreateUserController } from './infrastructure/http/create-user/create-user.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserModel } from '../shared/infrastructure/database/models/user.model';
import { RoleModel } from '../shared/infrastructure/database/models/role.model';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [SequelizeModule.forFeature([UserModel, RoleModel]), AuthModule],
  providers: [
    {
      provide: UserRepository,
      useClass: SequelizeUserRepository,
    },
    CreateUserUseCase,
  ],
  controllers: [CreateUserController],
  exports: [UserRepository],
})
export class UsersModule {}
