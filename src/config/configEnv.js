require('dotenv').config();

const env = {
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRE,
  COOKIE_EXPIRE: process.env.COOKIE_EXPIRE,
  MAIL_ID: process.env.MAIL_ID,
  MP: process.env.MP,
  CLOUD_NAME: process.env.CLOUD_NAME,
  API_KEY: process.env.API_KEY,
  SECRET_KEY: process.env.SECRET_KEY,
  CLIENT_ID: process.env.CLIENT_ID,
  APP_SECRET: process.env.APP_SECRET,
  PORT: process.env.PORT,
};

module.exports = env;
