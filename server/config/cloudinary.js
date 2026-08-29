const cloudinary = require('cloudinary').v2;
const fs = require('fs');

if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const isCloudinaryConfigured = () => {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

const uploadFileToStorage = async (file, folder = 'campus_resolve') => {
  if (isCloudinaryConfigured()) {
    const result = await cloudinary.uploader.upload(file.path, {
      folder,
      resource_type: 'auto',
    });
    // Remove temporary local file
    try {
      fs.unlinkSync(file.path);
    } catch (err) {
      console.error('Error removing temp file:', err);
    }
    return {
      url: result.secure_url,
      publicId: result.public_id,
      filename: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    };
  } else {
    // Local storage fallback
    const relativeUrl = `/uploads/${file.filename}`;
    return {
      url: relativeUrl,
      publicId: file.filename,
      filename: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    };
  }
};

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
  uploadFileToStorage,
};
