import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../../../users/infrastructure/http/create-user/user-response.http-dto';

export class LoginResponseDto {
  @ApiProperty({
    description: 'JWT authentication token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    type: String,
  })
  token: string;

  @ApiProperty({
    description: 'User information',
    type: UserResponseDto,
  })
  user: UserResponseDto;
}
