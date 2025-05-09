import { CreateUserUseCase } from '../../../application/use-cases/create-user/create-user.use-case';
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CreateUserHttpDto } from './create-user.http-dto';
import { UserProperties } from '../../../domain/entities/user';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserResponseDto } from './user-response.http-dto';
import { ERROR_RESPONSES } from '../../../../shared/infrastructure/http/swagger/error-responses';

@ApiTags('users')
@Controller('users')
export class CreateUserController {
  constructor(private createUserUseCase: CreateUserUseCase) {}

  @ApiOperation({ summary: 'Create a new user' })
  @ApiCreatedResponse({
    description: 'User successfully created',
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
    schema: {
      example: ERROR_RESPONSES.VALIDATION_ERROR,
    },
  })
  @ApiConflictResponse({
    description: 'User already exists',
    schema: {
      example: ERROR_RESPONSES.USER_ALREADY_EXISTS,
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    schema: {
      example: ERROR_RESPONSES.INTERNAL_SERVER_ERROR,
    },
  })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createUser(
    @Body() body: CreateUserHttpDto,
  ): Promise<Omit<UserProperties, 'password'>> {
    return await this.createUserUseCase.execute(body);
  }
}
