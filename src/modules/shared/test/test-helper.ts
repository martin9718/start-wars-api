import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Sequelize } from 'sequelize-typescript';
import { AppModule } from '../../../app.module';
import { HttpExceptionFilter } from '../infrastructure/http/filters/http-exception.filter';

export class TestHelper {
  private app: INestApplication;
  private sequelize: Sequelize;

  constructor() {}

  async init(): Promise<void> {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    this.app = moduleRef.createNestApplication();
    this.app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    this.app.useGlobalFilters(new HttpExceptionFilter());
    this.app.setGlobalPrefix('api');
    await this.app.init();

    this.sequelize = this.app.get(Sequelize);
  }

  getApp(): INestApplication {
    return this.app;
  }

  async clearDatabase(): Promise<void> {
    await this.sequelize.truncate({ cascade: true });
    await this.sequelize.model('MovieModel')?.destroy({
      where: {},
      force: true,
      truncate: true,
    });
  }

  async close(): Promise<void> {
    await this.app.close();
  }
}
