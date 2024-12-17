const express = require("express");
const mongoose = require("mongoose");
const Joi = require("joi");
const { campgroundSchema, reviewSchema } = require("./schemas.js");
const path = require("path");
const ejsMate = require("ejs-mate");
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user.js");

const campgrounds = require("./routes/campgrounds");
const reviews = require("./routes/reviews");

mongoose
  .connect("mongodb://127.0.0.1:27017/yelp-camp")
  .then(() => {
    console.log("MONGO CONNECTED!");
  })
  .catch((err) => {
    console.log("THERE WAS AN ERROR ON MONGO", err);
  });

const app = express();

app.engine("ejs", ejsMate); //we have to tell express to use this particular one, so we set it, so that it doesn't use the default one
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public"))); //added for serving static assets-from public folder

const sessionConfig = {
  secret: "thisshouldbeabettersecret!",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true, //for security
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //date.now is in milliseconds not in actual date, here it is set for a week
    //1000 ms in a day, 60s in min, 60 min in an hr, 24 hrs in a day, 7 days in a week
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session()); //setting session..for to set it logged in always until logged out....
passport.use(new localStrategy(User.authenticate())); //use the localStrategy and for that localStrategy the authentication method is going to be located on our User model called authenticate()...(made by passport)

passport.serializeUser(User.serializeUser()); //telling passport on how to serialise a user...serialize-how do we store data in the session
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success"); //we will have access to this in out templates (show route in campground.js) automatically
  //on every single request, we take whatever is under flash('success') and have access to it under locals under the key success (locals.success)
  res.locals.error = req.flash("error");
  next();
});

app.get("/fakeUser", async (req, res) => {
  const user = new User({ email: "anii@gmail.com", username: "anii" });
  const newUser = await User.register(user, "cats"); //done through the help of passport, take entire 'user' model as instance and then a password, hash it and store
  res.send(newUser);
});

// app.get("/makecampground", async (req, res) => {
//   const camp = new Campground({
//     title: "My Backyard",
//     description: "cheap camping",
//   });
//   await camp.save();
//   res.send(camp);
// });

//FOR ROUTER OF CAMPGROUNDS and REVIEWS
app.use("/campgrounds", campgrounds);
app.use("/campgrounds/:id/reviews", reviews); //NOTE: we have /:id also in the route, hence we must use mergeParams in reviews.js

app.get("/", (req, res) => {
  res.render("home");
});

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
