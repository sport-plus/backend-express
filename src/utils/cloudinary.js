const cloudinary = require('cloudinary');
const env = require('../config/configEnv');

cloudinary.config({
  cloud_name: env.CLOUD_NAME,
  api_key: env.API_KEY,
  api_secret: env.SECRET_KEY,
});

const cloudinaryUploadImg = async (fileToUploads) => {
  return new Promise((resolve) => {
    cloudinary.uploader.upload(fileToUploads, (result) => {
      resolve({ url: result.secure_url }, { resource_type: 'auto' });
    });
  });
};

module.exports = cloudinaryUploadImg;
