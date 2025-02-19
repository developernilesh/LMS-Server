// Require the Cloudinary library
const cloudinary = require("cloudinary").v2;

exports.uploadToCloudinary = async (file, folder, quality, height) => {
  const options = { folder, resource_type: "auto" };
  if (quality) options.quality = quality;
  if (height) options.height = height;
  const uploadedImage = await cloudinary.uploader.upload(file.tempFilePath, options);
  return uploadedImage;
}
