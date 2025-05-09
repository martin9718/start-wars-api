import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateMovieHttpDto {
  @ApiProperty({
    description: 'The title of the movie',
    example: 'The Phantom Menace',
    required: false,
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: 'The episode number',
    example: 1,
    required: false,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  episodeId?: number;

  @ApiProperty({
    description: 'The opening crawl text',
    example: 'Turmoil has engulfed the Galactic Republic...',
    required: false,
  })
  @IsString()
  @IsOptional()
  openingCrawl?: string;

  @ApiProperty({
    description: 'The director of the movie',
    example: 'George Lucas',
    required: false,
  })
  @IsString()
  @IsOptional()
  director?: string;

  @ApiProperty({
    description: 'The producer(s) of the movie',
    example: 'Rick McCallum',
    required: false,
  })
  @IsString()
  @IsOptional()
  producer?: string;

  @ApiProperty({
    description: 'The release date of the movie',
    example: '1999-05-19',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  releaseDate?: string;

  @ApiProperty({
    description: 'The URL of the movie',
    example: 'https://example.com/movies/1',
    required: false,
  })
  @IsString()
  @IsOptional()
  url?: string;
}
