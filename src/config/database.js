const mongoose = require('mongoose');
const env = require('./configEnv');

const connectDatabase = () => {
  try {
    mongoose.connect(env.MONGODB_URI).then((data) => {
      console.log(`Mongodb connected with server: ${env.MONGODB_URI}`);
    });
  } catch (error) {
    console.log('Database connection error');
  }
};

module.exports = connectDatabase;
