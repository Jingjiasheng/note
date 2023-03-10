import path from "path";

import { Sequelize } from "sequelize";


// eslint-disable-next-line import/no-mutable-exports
const sequelize: Sequelize = new Sequelize({
  dialect: "sqlite",
  storage: process.env.DB_PATH ?? path.join(__dirname, "../../data/database.sqlite")
});

const initDb = async (): Promise<void> => {

  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  }
  catch (error) {
    console.error("Unable to connect to the database:", error);
  }

  await sequelize.sync();

};

export { sequelize, initDb };