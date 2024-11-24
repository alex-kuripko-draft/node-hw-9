import { Sequelize } from 'sequelize';
import UserModel from './user.js';
import config from "../config/config.js";

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect,
});

const User = UserModel(sequelize);

export { sequelize, User };
