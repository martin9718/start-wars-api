export abstract class PasswordHasher {
  abstract compare(plaintext: string, hash: string): Promise<boolean>;
  abstract hash(password: string): Promise<string>;
}
