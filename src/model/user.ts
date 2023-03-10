
import type { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize";
import { DataTypes , Model } from "sequelize";

import { sequelize } from "../init/init_db";

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: string;

  declare email: string;

  declare password: string;

  declare enabled: boolean;

  declare created_at: CreationOptional<Date>;

  declare updated_at?: CreationOptional<Date>;

}

User.init({
  id: {
    type: DataTypes.STRING(26),
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING(),
    allowNull: true
  },
  password: {
    type: DataTypes.STRING(),
    allowNull: true
  },
  enabled: {
    type: DataTypes.BOOLEAN(),
    allowNull: false,
    defaultValue: false
  },

  created_at: DataTypes.DATE(),
  updated_at: DataTypes.DATE()
}, {
  sequelize: sequelize,
  underscored: true,
  tableName: "users",
  timestamps: true,
  modelName: "User"
});

export { User };
