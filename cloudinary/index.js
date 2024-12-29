const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

//associtating our account with the cloudinary instance
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

//setting up an instance of cloudinary storage in this file
//bascially the cloudinary storage below is now configured/setup it has the credentials four our particular cloudinary account, upload stuff to folder YelpCamp.
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "YelpCamp",
    allowed_formats: ["jpeg", "png", "jfif", "jpg"],
  },
});

module.exports = {
  cloudinary,
  storage,
};
