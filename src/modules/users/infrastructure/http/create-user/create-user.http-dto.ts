import { IsEmail, IsInt, IsNotEmpty, MinLength } from 'class-validator';
import { Match } from '../../../../shared/infrastructure/decorators/match.decorator';

export class CreateUserHttpDto {
  @IsNotEmpty({ message: 'name is required' })
  readonly name: string;

  @IsEmail({}, { message: 'email must be valid' })
  @IsNotEmpty({ message: 'email is required' })
  readonly email: string;

  @MinLength(8, { message: 'password must be at least 8 characters long' })
  @IsNotEmpty({ message: 'password is required' })
  readonly password: string;

  @Match('password')
  @IsNotEmpty({ message: 'passwordConfirmation is required' })
  readonly passwordConfirmation: string;

  @IsInt({ message: 'roleId must be a valid number' })
  @IsNotEmpty({ message: 'roleId is required' })
  readonly roleId: number;
}
