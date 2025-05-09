import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { ERROR_RESPONSES } from '../../../../shared/infrastructure/http/swagger/error-responses';
import { LoginUseCase } from '../../../application/use-cases/login/login.use-case';
import { LoginResponseDto } from './login-response.http-dto';
import { LoginHttpDto } from './login.http-dto';
import { UserProperties } from '../../../../users/domain/entities/user';

@ApiTags('auth')
@Controller('auth')
export class LoginController {
  constructor(private loginUseCase: LoginUseCase) {}

  @ApiOperation({ summary: 'Login with email and password' })
  @ApiOkResponse({
    description: 'Login successful',
    type: LoginResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
    schema: {
      example: ERROR_RESPONSES.VALIDATION_ERROR,
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
    schema: {
      example: ERROR_RESPONSES.INVALID_CREDENTIALS,
    },
  })
  @ApiConflictResponse({
    description: 'User account is not active',
    schema: {
      example: ERROR_RESPONSES.USER_NOT_ACTIVE,
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    schema: {
      example: ERROR_RESPONSES.INTERNAL_SERVER_ERROR,
    },
  })
  @HttpCode(HttpStatus.OK)
  @Post('/login')
  async login(
    @Body() body: LoginHttpDto,
  ): Promise<{ token: string; user: Omit<UserProperties, 'password'> }> {
    return await this.loginUseCase.execute(body);
  }
}
