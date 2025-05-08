import { CreateUserUseCase } from '../../../application/use-cases/create-user/create-user.use-case';
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CreateUserHttpDto } from './create-user.http-dto';
import { UserProperties } from '../../../domain/entities/user';

@Controller('users')
export class CreateUserController {
  constructor(private createUserUseCase: CreateUserUseCase) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createUser(
    @Body() body: CreateUserHttpDto,
  ): Promise<Omit<UserProperties, 'password'>> {
    return await this.createUserUseCase.execute(body);
  }
}
