import 'dotenv/config';
import { Sequelize } from 'sequelize';
import path from 'path';

let sequelize: Sequelize;

if (process.env.DATABASE_URL) {
  // If we have a direct DATABASE_URL (common in hosting like Heroku/Render)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres', // default to postgres
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} else if (process.env.DB_NAME && process.env.DB_USER && process.env.DB_PASS) {
  // Configured with individual env variables (MySQL or PostgreSQL)
  const dialect = (process.env.DB_DIALECT || 'mysql') as 'mysql' | 'postgres';
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      dialect: dialect,
      logging: false,
    }
  );
} else {
  // Default: local SQLite file
  const storagePath = path.join(process.cwd(), 'database.sqlite');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: storagePath,
    logging: false,
  });
  console.log(`Sequelize initialized with local SQLite database at: ${storagePath}`);
}

export default sequelize;
