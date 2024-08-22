import { DataTypes } from "sequelize";
import sequelize from "../sequelize.mjs";
import User from "./User.mjs";

const Token = sequelize.define("Token", {
  access_token: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  refresh_token: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  scope: {
    type: DataTypes.TEXT,
  },
  token_type: {
    type: DataTypes.STRING,
  },
  expiry_date: {
    type: DataTypes.BIGINT,
  },
});

Token.belongsTo(User, { foreignKey: "user_id" });

export default Token;
