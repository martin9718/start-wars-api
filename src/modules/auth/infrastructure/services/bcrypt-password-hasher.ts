import * as bcrypt from 'bcrypt';
import { PasswordHasher } from '../../domain/services/password-hasher';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BcryptPasswordHasher extends PasswordHasher {
  private readonly saltRounds = 10;

  async compare(plaintext: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plaintext, hash);
  }

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }
}
