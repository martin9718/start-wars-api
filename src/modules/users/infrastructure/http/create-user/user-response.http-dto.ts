import { ApiProperty } from '@nestjs/swagger';

export class RoleResponseDto {
  @ApiProperty({
    description: 'Role ID',
    example: 2,
    type: Number,
  })
  id: number;

  @ApiProperty({
    description: 'Role name',
    example: 'User',
    type: String,
  })
  name: string;
}

export class UserResponseDto {
  @ApiProperty({
    description: 'Unique user identifier (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String,
  })
  id: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
    type: String,
  })
  name: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
    type: String,
    format: 'email',
  })
  email: string;

  @ApiProperty({
    description: 'Indicates if the user account is active',
    example: true,
    type: Boolean,
    default: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'User role information',
    type: RoleResponseDto,
  })
  role: RoleResponseDto;

  @ApiProperty({
    description: 'User creation timestamp',
    example: '2025-05-08T12:00:00Z',
    type: Date,
  })
  createdAt: Date;

  @ApiProperty({
    description: 'User last update timestamp',
    example: '2025-05-08T12:00:00Z',
    type: Date,
  })
  updatedAt: Date;
}
