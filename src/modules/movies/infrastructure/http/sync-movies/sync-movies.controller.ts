import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiInternalServerErrorResponse,
  ApiServiceUnavailableResponse,
} from '@nestjs/swagger';
import { SyncMoviesUseCase } from '../../../application/use-cases/sync-movies/sync-movies.use-case';
import { ERROR_RESPONSES } from '../../../../shared/infrastructure/http/swagger/error-responses';
import { SyncMoviesResponseDto } from '../../../application/use-cases/sync-movies/sync-movies-response.http-dto';

@ApiTags('movies')
@Controller('movies')
export class SyncMoviesController {
  constructor(private readonly syncMoviesUseCase: SyncMoviesUseCase) {}

  @ApiOperation({
    summary: 'Sync movies from SWAPI',
    description:
      'Synchronizes movies from the Star Wars API. Requires admin role.',
  })
  @ApiOkResponse({
    description: 'Movies synchronized successfully',
    type: SyncMoviesResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error or external API error',
    schema: {
      example: ERROR_RESPONSES.INTERNAL_SERVER_ERROR,
    },
  })
  @ApiServiceUnavailableResponse({
    description:
      'External service unavailable or error when connecting to SWAPI',
    schema: {
      example: ERROR_RESPONSES.EXTERNAL_SERVICE_ERROR,
    },
  })
  @HttpCode(HttpStatus.OK)
  @Post('sync')
  async syncMovies() {
    return this.syncMoviesUseCase.execute();
  }
}
