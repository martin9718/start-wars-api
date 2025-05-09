import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiInternalServerErrorResponse,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ERROR_RESPONSES } from '../../../../shared/infrastructure/http/swagger/error-responses';
import { JwtAuthGuard } from '../../../../auth/infrastructure/guards/jwt.guard';
import { Movie } from '../../../domain/entities/movie';
import { GetAllMoviesUseCase } from '../../../application/use-cases/get-all-movies/get-all-movies.use-case';
import { MovieDto } from '../sync-movies/sync-movies-response.http-dto';

@ApiTags('movies')
@Controller('movies')
export class GetAllMoviesController {
  constructor(private readonly getAllMoviesUseCase: GetAllMoviesUseCase) {}

  @ApiOperation({
    summary: 'Get all movies',
    description: 'Retrieves all movies from the database',
  })
  @ApiOkResponse({
    description: 'List of movies retrieved successfully',
    type: MovieDto,
    isArray: true,
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authenticated',
    schema: {
      example: ERROR_RESPONSES.UNAUTHORIZED,
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    schema: {
      example: ERROR_RESPONSES.INTERNAL_SERVER_ERROR,
    },
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get()
  async getAllMovies(): Promise<Movie[]> {
    return this.getAllMoviesUseCase.execute();
  }
}
