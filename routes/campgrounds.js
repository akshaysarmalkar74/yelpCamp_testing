const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const Campground = require("../models/campground");
const {
  isLoggedIn,
  validateCampground,
  isAuthor,
} = require("../middleware.js");

router.get(
  "/",
  catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
  })
);

//for getting the id of the particular li and redirecting to that page
//for creating new campground
router.post(
  "/",
  isLoggedIn,
  validateCampground,
  catchAsync(async (req, res, next) => {
    //if (!req.body.campground) throw new ExpressError("Invalid Campground", 400); //we do this so that if a person tries to create a campground using just html or postman...
    //For using Joi we define basic schema, note that this is not a mongoose schema..but something that is evaluated before that
    //can be checked using POSTMAN and setting key to campground[price] and so on as defined below
    // const campgroundSchema = Joi.object({
    //   //we are expecting it to be an object below and also to be required()
    //   campground: Joi.object({
    //     title: Joi.string().required(),
    //     price: Joi.number().required().min(0), //no negative minimum is only 0
    //     image: Joi.string().required(),
    //     location: Joi.string().required(),
    //     description: Joi.string().required(),
    //   }).required(), //note that we are sending everything under the key of campground..example campground[price] and so on
    // });
    // const { error } = campgroundSchema.validate(req.body);
    // if (error) {
    //   const msg = error.details.map((el) => el.message).join(","); //.map creates a new array populated with the results of the function that is called inside with the elements of that array.
    //   //basically without an arrow function: error.details.map(function(el){return el.message})//which gives an array of strings which is joined by , commas.
    //   throw new ExpressError(msg, 400);
    // }
    //console.log(result);
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id; //comes from auth
    await campground.save();
    req.flash("success", "Successfully made a campground!");
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

//remember that we cannot put /new below /:id because if done so, /new will be considered as if given to /:id
router.get("/new", isLoggedIn, (req, res) => {
  /* below is moved to middleware.js as isLoggedIn */
  // if (!req.isAuthenticated()) {
  //   //basically we do the following if we still aren't authenticated but try to hit this route still
  //   //isAuthenticated() is coming from passport
  //   req.flash("error", "You must be signed in");
  //   return res.redirect("/login");
  // }
  res.render("campgrounds/new");
});

router.get(
  "/:id",
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
      .populate("reviews")
      .populate("author"); //make sure author is also viewable not just id(as seen in relationships/ one to many and stuff), but still have to 'show' it in show.ejs
    //If the campground did not find that particular one with that ID flash the below error and redirect-can happen when yo
    // u copy paste a deleted route of a campground

    if (!campground) {
      req.flash("error", "Campground does not exist");
      res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", { campground });
  })
);

router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
      req.flash("error", "Campground does not exist, cannot edit!");
      res.redirect("/campgrounds");
    }
    res.render("campgrounds/edit", { campground });
  })
);

router.put(
  "/:id",
  isLoggedIn,
  isAuthor,
  validateCampground,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    }); //spread operator instead of keeping it in one line it spreads into different ones like -
    //{
    //title:
    //location:
    //}
    req.flash("success", "Successfully updated camground!");
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

router.delete(
  "/:id",
  isLoggedIn,
  isAuthor,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted campground");
    res.redirect("/campgrounds");
  })
);

module.exports = router;
