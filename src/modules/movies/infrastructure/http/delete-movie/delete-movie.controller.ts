import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiNoContentResponse,
  ApiInternalServerErrorResponse,
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
import { DeleteMovieUseCase } from '../../../application/use-cases/delete-movie/delete-movie.use-case';
import { ApiAuthErrors } from '../../../../shared/infrastructure/http/swagger/decorators/api-auth-errors.decorator';

@ApiTags('movies')
@Controller('movies')
export class DeleteMovieController {
  constructor(private readonly deleteMovieUseCase: DeleteMovieUseCase) {}

  @ApiOperation({
    summary: 'Delete a movie',
    description: 'Soft deletes a movie from the database. Requires admin role.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'The ID of the movie to delete',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiNoContentResponse({
    description: 'Movie deleted successfully',
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
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    await this.deleteMovieUseCase.execute(id);
  }
}
