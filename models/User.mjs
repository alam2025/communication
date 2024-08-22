import { DataTypes } from "sequelize";
import sequelize from "../sequelize.mjs";

const User = sequelize.define("User", {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  googleId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});

export default User;
