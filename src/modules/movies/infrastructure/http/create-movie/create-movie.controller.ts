import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { ERROR_RESPONSES } from '../../../../shared/infrastructure/http/swagger/error-responses';
import { JwtAuthGuard } from '../../../../auth/infrastructure/guards/jwt.guard';
import { RoleGuard } from '../../../../auth/infrastructure/guards/role.guard';
import { RequiredRoles } from '../../../../auth/infrastructure/decorators/roles.decorator';
import { ROLES } from '../../../../users/domain/types';
import { CreateMovieUseCase } from '../../../application/use-cases/create-movie/create-movie.use-case';
import { CreateMovieHttpDto } from './create-movie.http-dto';
import { Movie } from '../../../domain/entities/movie';
import { MovieDto } from '../sync-movies/sync-movies-response.http-dto';
import { ApiAuthErrors } from '../../../../shared/infrastructure/http/swagger/decorators/api-auth-errors.decorator';

@ApiTags('movies')
@Controller('movies')
export class CreateMovieController {
  constructor(private readonly createMovieUseCase: CreateMovieUseCase) {}

  @ApiOperation({
    summary: 'Create a new movie',
    description: 'Creates a new movie in the database. Requires admin role.',
  })
  @ApiCreatedResponse({
    description: 'Movie created successfully',
    type: MovieDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
    schema: {
      example: ERROR_RESPONSES.VALIDATION_ERROR,
    },
  })
  @ApiAuthErrors()
  @ApiForbiddenResponse({
    description: 'User does not have required role',
    schema: {
      example: ERROR_RESPONSES.FORBIDDEN,
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    schema: {
      example: ERROR_RESPONSES.INTERNAL_SERVER_ERROR,
    },
  })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @RequiredRoles(ROLES.ADMIN.name)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(@Body() dto: CreateMovieHttpDto): Promise<Movie> {
    const releaseDate = new Date(dto.releaseDate);

    return this.createMovieUseCase.execute({
      ...dto,
      releaseDate,
    });
  }
}
