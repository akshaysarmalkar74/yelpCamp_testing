const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const Campground = require("../models/campground");
const Review = require("../models/review");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");

router.post(
  "/",
  isLoggedIn,
  validateReview,
  catchAsync(async (req, res) => {
    //res.send("YES!");
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review); //as we have 'named' it as review[body] in show page
    //reviews is refering property reviews in schema of campground.js
    review.author = req.user._id;
    campground.reviews.push(
      review
    ); /*NOTE: WE wont have access to .id from campground and hence when we put this
    to reviews router from app.js, we get an error while we leave a review.
    Routers get seperate params.
    SO we set {mergeParams: true} in express.Router above */
    /*NOTE: WE DON'T HAVE TO SET mergeParams in campgrounds.js because we don't put the /:id also in the app.use
    of app.js */
    await review.save();
    await campground.save();
    req.flash("success", "Created new review");
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    //pull from the reviews array from where we have reviewId
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Successfully deleted review");
    res.redirect(`/campgrounds/${id}`);
  })
);

module.exports = router;
