import { Module } from '@nestjs/common';
import { PasswordHasher } from './domain/services/password-hasher';
import { BcryptPasswordHasher } from './infrastructure/services/bcrypt-password-hasher';

@Module({
  imports: [],
  providers: [
    {
      provide: PasswordHasher,
      useClass: BcryptPasswordHasher,
    },
  ],
  controllers: [],
  exports: [PasswordHasher],
})
export class AuthModule {}
