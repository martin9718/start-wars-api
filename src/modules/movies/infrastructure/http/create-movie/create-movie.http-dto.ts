import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateMovieHttpDto {
  @ApiProperty({
    description: 'The title of the movie',
    example: 'The Phantom Menace',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'The episode number',
    example: 1,
  })
  @IsInt()
  @Min(1)
  episodeId: number;

  @ApiProperty({
    description: 'The opening crawl text',
    example: 'Turmoil has engulfed the Galactic Republic...',
  })
  @IsString()
  @IsNotEmpty()
  openingCrawl: string;

  @ApiProperty({
    description: 'The director of the movie',
    example: 'George Lucas',
  })
  @IsString()
  @IsNotEmpty()
  director: string;

  @ApiProperty({
    description: 'The producer(s) of the movie',
    example: 'Rick McCallum',
  })
  @IsString()
  @IsNotEmpty()
  producer: string;

  @ApiProperty({
    description: 'The release date of the movie',
    example: '1999-05-19',
  })
  @IsDateString()
  releaseDate: string;

  @ApiProperty({
    description: 'The URL of the movie (optional)',
    example: 'https://example.com/movies/1',
    required: false,
  })
  @IsString()
  @IsOptional()
  url?: string;
}
