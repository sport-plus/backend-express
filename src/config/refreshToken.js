const jwt = require('jsonwebtoken');
const env = require('./configEnv');

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, env.JWT_SECRET, { expiresIn: '3d' });
};

module.exports = { generateRefreshToken };
