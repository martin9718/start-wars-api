import {
  Column,
  Model,
  Table,
  DataType,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';

@Table({
  tableName: 'movies',
})
export class MovieModel extends Model {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare title: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare episode_id: number;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare opening_crawl: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare director: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare producer: string;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
  })
  declare release_date: Date;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare url: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    unique: true,
  })
  declare external_id: string;

  @CreatedAt
  declare created_at: Date;

  @UpdatedAt
  declare updated_at: Date;
}
