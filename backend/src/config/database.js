import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'support_tickets',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres123',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

export const connectDB = async () => {
  let retries = 10;
  while (retries > 0) {
    try {
      await sequelize.authenticate();
      console.log('✅ PostgreSQL connected successfully');
      return;
    } catch (err) {
      retries--;
      console.log(`⏳ DB not ready, retrying... (${retries} left)`);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
  throw new Error('❌ Could not connect to PostgreSQL after multiple attempts');
};

export default sequelize;
