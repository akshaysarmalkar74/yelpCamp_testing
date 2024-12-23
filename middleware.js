const { campgroundSchema, reviewSchema } = require("./schemas.js");
const ExpressError = require("./utils/ExpressError");
const Campground = require("./models/campground");
const Review = require("./models/review.js");

module.exports.isLoggedIn = (req, res, next) => {
  //console.log("REQ.USER", req.user); //req.user is coming from the session, which is deserialised to give back who the user is that is stored
  //above gives back id, username and email
  if (!req.isAuthenticated()) {
    //basically we do the following if we still aren't authenticated but try to hit this route still
    //isAuthenticated() is coming from passport
    //console.log(req.path, req.originalUrl); //shows the url that you are visiting before logging in
    req.session.returnTo = req.originalUrl; //for returning to the originalUrl that we were at before logging in
    req.flash("error", "You must be signed in");
    return res.redirect("/login");
  }
  next();
};

module.exports.storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }
  next();
};

module.exports.validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(","); //.map creates a new array populated with the results of the function that is called inside with the elements of that array.
    //basically without an arrow function: error.details.map(function(el){return el.message})//which gives an array of strings which is joined by , commas.
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

//cannot delete a campground if you are not the author of that campground.
module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

//below middleware makes sure that the review delete cannot be done if you are not the user, in the case that we are not hiding the the delete button for the review on the show page if I am not the author
module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

//after creating app.post(router.post) for review, we do below
module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};
