import { forwardRef, Module } from '@nestjs/common';
import { PasswordHasher } from './domain/services/password-hasher';
import { BcryptPasswordHasher } from './infrastructure/services/bcrypt-password-hasher';
import { LoginUseCase } from './application/use-cases/login/login.use-case';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginController } from './infrastructure/http/login/login.controller';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => {
        const jwtSecretKey = config.get<string>('JWT_SECRET_KEY');
        const jwtExpirationTime = config.get<string>('JWT_EXPIRATION_TIME');
        return {
          secret: jwtSecretKey,
          signOptions: {
            expiresIn: jwtExpirationTime,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [
    JwtStrategy,
    {
      provide: PasswordHasher,
      useClass: BcryptPasswordHasher,
    },
    LoginUseCase,
  ],
  controllers: [LoginController],
  exports: [PasswordHasher],
})
export class AuthModule {}
