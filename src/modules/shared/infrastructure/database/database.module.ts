import { Module, Type } from '@nestjs/common';
import { SequelizeConfigService } from './sequelize-config.service';
import { SequelizeModule, SequelizeOptionsFactory } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useClass: SequelizeConfigService as Type<SequelizeOptionsFactory>,
    }),
  ],
  providers: [SequelizeConfigService],
})
export class DatabaseModule {}
