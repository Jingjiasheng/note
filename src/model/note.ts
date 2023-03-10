import type { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize";
import { DataTypes , Model } from "sequelize";

import { sequelize } from "../init/init_db";

class Note extends Model<InferAttributes<Note>, InferCreationAttributes<Note>> {
  declare id: string;

  declare title: string;

  declare bg: string;

  declare desc: string;

  declare detail: string;

  declare owner_id: string;

  declare is_deleted: boolean;

  declare created_at: CreationOptional<Date>;

  declare updated_at?: CreationOptional<Date>;

}

Note.init({
  id: {
    type: DataTypes.STRING(26),
    primaryKey: true
  },
  owner_id: {
    type: DataTypes.STRING(26),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(),
    allowNull: true
  },
  bg: {
    type: DataTypes.STRING(),
    allowNull: true
  },
  desc: {
    type: DataTypes.STRING(),
    allowNull: true
  },
  detail: {
    type: DataTypes.STRING(),
    allowNull: true
  },
  is_deleted: {
    type: DataTypes.BOOLEAN(),
    allowNull: false,
    defaultValue: false
  },

  created_at: DataTypes.DATE(),
  updated_at: DataTypes.DATE()
}, {
  sequelize: sequelize,
  underscored: true,
  tableName: "notes",
  timestamps: true,
  modelName: "Note"
});


export { Note };
