import { IsEmail, IsInt, IsNotEmpty, MinLength } from 'class-validator';
import { Match } from '../../../../shared/infrastructure/decorators/match.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserHttpDto {
  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
    required: true,
  })
  @IsNotEmpty({ message: 'name is required' })
  readonly name: string;

  @ApiProperty({
    description: 'User email address (unique)',
    example: 'john.doe@example.com',
    required: true,
    format: 'email',
  })
  @IsEmail({}, { message: 'email must be valid' })
  @IsNotEmpty({ message: 'email is required' })
  readonly email: string;

  @ApiProperty({
    description: 'User password (minimum 8 characters)',
    example: 'Password123!',
    required: true,
    minLength: 8,
    format: 'password',
  })
  @MinLength(8, { message: 'password must be at least 8 characters long' })
  @IsNotEmpty({ message: 'password is required' })
  readonly password: string;

  @ApiProperty({
    description: 'Password confirmation (must match password)',
    example: 'Password123!',
    required: true,
    format: 'password',
  })
  @Match('password')
  @IsNotEmpty({ message: 'passwordConfirmation is required' })
  readonly passwordConfirmation: string;

  @ApiProperty({
    description: 'User role ID',
    example: 2,
    required: true,
    type: Number,
  })
  @IsInt({ message: 'roleId must be a valid number' })
  @IsNotEmpty({ message: 'roleId is required' })
  readonly roleId: number;
}
