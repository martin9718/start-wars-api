import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
  ApiParam,
  ApiForbiddenResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ERROR_RESPONSES } from '../../../../shared/infrastructure/http/swagger/error-responses';
import { JwtAuthGuard } from '../../../../auth/infrastructure/guards/jwt.guard';
import { RoleGuard } from '../../../../auth/infrastructure/guards/role.guard';
import { RequiredRoles } from '../../../../auth/infrastructure/decorators/roles.decorator';
import { ROLES } from '../../../../users/domain/types';
import { FindByIdUseCase } from '../../../application/use-cases/find-by-id/find-by-id.use-case';
import { Movie } from '../../../domain/entities/movie';
import { MovieDto } from '../sync-movies/sync-movies-response.http-dto';
import { ApiAuthErrors } from '../../../../shared/infrastructure/http/swagger/decorators/api-auth-errors.decorator';

@ApiTags('movies')
@Controller('movies')
export class FindMovieByIdController {
  constructor(private readonly findByIdUseCase: FindByIdUseCase) {}

  @ApiOperation({
    summary: 'Find movie by ID',
    description: 'Retrieves a specific movie by its ID. Requires user role.',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the movie to retrieve',
    type: String,
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',
  })
  @ApiOkResponse({
    description: 'Movie retrieved successfully',
    type: MovieDto,
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
  @RequiredRoles(ROLES.USER.name)
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findById(@Param('id') id: string): Promise<Movie> {
    return this.findByIdUseCase.execute(id);
  }
}
