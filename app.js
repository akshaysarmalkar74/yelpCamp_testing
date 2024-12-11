const express = require("express");
const mongoose = require("mongoose");
const Joi = require("joi");
const { campgroundSchema, reviewSchema } = require("./schemas.js");
const path = require("path");
const app = express();
const ejsMate = require("ejs-mate");
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");
const Campground = require("./models/campground");
const Review = require("./models/review");

const campgrounds = require("./routes/campgrounds");

app.engine("ejs", ejsMate); //we have to tell express to use this particular one, so we set it, so that it doesn't use the default one
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect("mongodb://127.0.0.1:27017/yelp-camp")
  .then(() => {
    console.log("MONGO CONNECTED!");
  })
  .catch((err) => {
    console.log("THERE WAS AN ERROR ON MONGO", err);
  });

// app.get("/makecampground", async (req, res) => {
//   const camp = new Campground({
//     title: "My Backyard",
//     description: "cheap camping",
//   });
//   await camp.save();
//   res.send(camp);
// });

//after creating app.post for review we do below
const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

//FOR ROUTER OF CAMPGROUNDS
app.use("/campgrounds", campgrounds);

app.get("/", (req, res) => {
  res.render("home");
});

app.post(
  "/campgrounds/:id/reviews",
  validateReview,
  catchAsync(async (req, res) => {
    //res.send("YES!");
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review); //as we have 'named' it as review[body] in show page
    //reviews is refering property reviews in schema of campground.js
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

app.delete(
  "/campgrounds/:id/reviews/:reviewId",
  catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    //pull from the reviews array from where we have reviewId
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
  })
);

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  //const { statusCode = 500, message = "Something Went Wrong" } = err; //we rempve the message from the destructuring
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Oh no something went wrong"; //if the error something not defined at all/built in
  //res.status(statusCode).send(message);
  res.status(statusCode).render("error", { err }); //so message is basically in the render part
});

app.listen(3000, () => {
  console.log("listening on port 3000");
});
