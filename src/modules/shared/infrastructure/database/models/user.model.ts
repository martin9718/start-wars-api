import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { RoleModel } from './role.model';

@Table({
  tableName: 'users',
})
export class UserModel extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare password: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  declare is_active: boolean;

  @ForeignKey(() => RoleModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare role_id: number;

  @CreatedAt
  declare created_at: Date;

  @UpdatedAt
  declare updated_at: Date;

  @BelongsTo(() => RoleModel)
  declare role: RoleModel;
}
