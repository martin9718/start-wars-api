import { ApiProperty } from '@nestjs/swagger';

export class MovieDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6' })
  id: string;

  @ApiProperty({ example: 'A New Hope' })
  title: string;

  @ApiProperty({ example: 4 })
  episodeId: number;

  @ApiProperty({
    example:
      'It is a period of civil war. Rebel spaceships, striking from a hidden base...',
  })
  openingCrawl: string;

  @ApiProperty({ example: 'George Lucas' })
  director: string;

  @ApiProperty({ example: 'Gary Kurtz, Rick McCallum' })
  producer: string;

  @ApiProperty({ example: '1977-05-25T00:00:00.000Z' })
  releaseDate: Date;

  @ApiProperty({ example: 'https://swapi.py4e.com/api/films/1/' })
  url: string;

  @ApiProperty({ example: '1' })
  externalId: string;

  @ApiProperty({ example: '2025-05-08T10:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-05-08T10:30:00.000Z' })
  updatedAt: Date;
}

export class SyncMoviesResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 6 })
  count: number;

  @ApiProperty({
    type: [MovieDto],
    description: 'List of synchronized movies',
  })
  movies: MovieDto[];
}
