import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginHttpDto {
  @ApiProperty({
    description: 'User email',
    example: 'john.doe@example.com',
    required: true,
    format: 'email',
  })
  @IsEmail({}, { message: 'email must be valid' })
  @IsNotEmpty({ message: 'email is required' })
  readonly email: string;

  @ApiProperty({
    description: 'User password',
    example: 'mySecurePassword123',
    required: true,
    format: 'password',
  })
  @IsString({ message: 'password must be a string' })
  @IsNotEmpty({ message: 'password is required' })
  readonly password: string;
}
