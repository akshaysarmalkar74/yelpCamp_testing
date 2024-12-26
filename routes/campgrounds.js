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

router
  .route("/")
  .get(catchAsync(campgrounds.index))
  .post(
    isLoggedIn,
    validateCampground,
    catchAsync(campgrounds.createCampground)
  );

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
