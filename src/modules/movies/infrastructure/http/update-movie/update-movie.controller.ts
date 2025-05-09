import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiInternalServerErrorResponse,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ERROR_RESPONSES } from '../../../../shared/infrastructure/http/swagger/error-responses';
import { JwtAuthGuard } from '../../../../auth/infrastructure/guards/jwt.guard';
import { RoleGuard } from '../../../../auth/infrastructure/guards/role.guard';
import { RequiredRoles } from '../../../../auth/infrastructure/decorators/roles.decorator';
import { ROLES } from '../../../../users/domain/types';
import { UpdateMovieUseCase } from '../../../application/use-cases/update-movie/update-movie.use-case';
import { UpdateMovieHttpDto } from './update-movie.http-dto';
import { Movie } from '../../../domain/entities/movie';
import { MovieDto } from '../sync-movies/sync-movies-response.http-dto';
import { ApiAuthErrors } from '../../../../shared/infrastructure/http/swagger/decorators/api-auth-errors.decorator';

@ApiTags('movies')
@Controller('movies')
export class UpdateMovieController {
  constructor(private readonly updateMovieUseCase: UpdateMovieUseCase) {}

  @ApiOperation({
    summary: 'Update a movie',
    description:
      'Updates an existing movie in the database. Requires admin role.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'The ID of the movie to update',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'Movie updated successfully',
    type: MovieDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
    schema: {
      example: ERROR_RESPONSES.VALIDATION_ERROR,
    },
  })
  @ApiNotFoundResponse({
    description: 'Movie not found',
    schema: {
      example: ERROR_RESPONSES.MOVIE_NOT_FOUND,
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
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @RequiredRoles(ROLES.ADMIN.name)
  @HttpCode(HttpStatus.OK)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMovieHttpDto,
  ): Promise<Movie> {
    const { releaseDate, ...restProps } = dto;

    const updateData = {
      id,
      ...restProps,
      ...(releaseDate ? { releaseDate: new Date(releaseDate) } : {}),
    };

    return this.updateMovieUseCase.execute(updateData);
  }
}
