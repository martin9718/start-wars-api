import { ConfigService } from '@nestjs/config';
import {
  SequelizeModuleOptions,
  SequelizeOptionsFactory,
} from '@nestjs/sequelize';
import { Dialect } from 'sequelize';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SequelizeConfigService implements SequelizeOptionsFactory {
  constructor(private configService: ConfigService) {}

  createSequelizeOptions(): SequelizeModuleOptions {
    const env = this.configService.get<string>('NODE_ENV');

    if (env !== 'testing') {
      return {
        host: this.configService.get<string>('DB_HOST'),
        database: this.configService.get<string>('DB_NAME'),
        port: this.configService.get<number>('DB_PORT'),
        username: this.configService.get<string>('DB_USER'),
        password: this.configService.get<string>('DB_PASSWORD'),
        dialect: this.configService.get<string>('DB_DIALECT') as Dialect,
        autoLoadModels: true,
        synchronize: false,
        logging: env === 'development' ? console.log : false,
        pool: {
          max: 20,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
        dialectOptions: {
          ssl: this.configService.get<boolean>('DB_SSL', false)
            ? {
                require: true,
                rejectUnauthorized: false,
              }
            : false,
        },
      };
    } else {
      return {
        dialect: 'sqlite' as Dialect,
        storage: ':memory:',
        synchronize: true,
        autoLoadModels: true,
        logging: false,
      };
    }
  }
}
