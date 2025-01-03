const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const Campground = require("../models/campground");
const campgrounds = require("../controllers/campgrounds.js");
const {
  isLoggedIn,
  validateCampground,
  isAuthor,
} = require("../middleware.js");
const multer = require("multer"); //we install and use multer middleware for pasing the uploaded files, uploading is done through enctype="multipart/form-data" as seen in new.ejs.
// //after uplaoding we get a an empty object, therefore we use this middleware to parse it.
// const upload = multer({ dest: "uploads/" }); //destination for uploads
const { storage } = require("../cloudinary"); //node automatically looks for a .js file
const upload = multer({ storage }); //instead of storing in uploads/ folder like in above commented case we do it in cloudinary now

router
  .route("/")
  .get(catchAsync(campgrounds.index))
  //NOTE: We are moving the validate campground after the upload.araay('image'), since we envounter a problem to validate the image because of joi...for now it the image won't be validated
  .post(
    isLoggedIn,
    upload.array("image"),
    validateCampground,
    catchAsync(campgrounds.createCampground)
  ); //instead of just the below post route for uploading image we do the above of upload.array('image')

// .post(
//   upload.array(
//     "image"
//   ) /*upload.single for one image, upload.array for multiple */,
//   /*piece of form data named image is looked for uploading...this line of code is used through mutler middleware */
//   (req, res) => {
//     console.log(req.body, req.files);
//     res.send("it worked!");
//   }
// );

//remember that we cannot put /new below /:id because if done so, /new will be considered as if given to /:id
router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router
  .route("/:id")
  //for getting the id of the particular li and redirecting to that page
  //for creating new campground
  .get(catchAsync(campgrounds.showCampground))
  .put(
    isLoggedIn,
    isAuthor,
    upload.array("image"),
    validateCampground,
    catchAsync(campgrounds.updateCampground)
  )
  .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(campgrounds.renderEditForm)
);

module.exports = router;
