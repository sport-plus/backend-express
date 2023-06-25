const jwt = require('jsonwebtoken');
const env = require('./configEnv');

const generateToken = (id) => {
  return jwt.sign({ id }, env.JWT_SECRET, { expiresIn: '1d' });
};

module.exports = { generateToken };
