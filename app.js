if (process.env.NODE_ENV !== "production") {
  /*process.env.node environment is an environment variable that is usually just 'developemnt' or 'production'.
  We have been running in development this whole time, when we deploy we will be running our code in production.
  So according to the if statement, only if we are in development mode, require the below package and take stuff from .env file and add them to process.env and acces them in this file */
  require("dotenv").config();
}

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
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

/*
• LocalStrategy — We use passport-local to create a new LocalStrategy. 
This strategy uses the username and password fields from the login form to authenticate the user. 
The User.authenticate() method, also provided by passport-local-mongoose, handles the verification of 
the credentials. If the credentials are correct, Passport will proceed to serialize the user and establish a session.
*/

const userRoutes = require("./routes/users.js");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");

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
app.use(express.urlencoded({ extended: true })); //for parsing req.body which is by default undefined, it is populated when we use this line of code and req.body can be accessed, they are all in key-value pairs.
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
passport.use(new LocalStrategy(User.authenticate())); //use the localStrategy and for that localStrategy the authentication method is going to be located on our User model called authenticate()...(made by passport)

passport.serializeUser(User.serializeUser()); //telling passport on how to serialise a user...serialize-how do we store data in the session
passport.deserializeUser(User.deserializeUser());
/*
•When a POST request with the user’s login information is made to the '/login' route, passport uses the local 
authentication strategy to verify that the user’s credentials are valid.

•It then serializes the provided User model into one value that is stored in the session object provided by express-session.

•When future requests from the same user are made with the session cookie, 
passport uses the serialized session value to deserialize or retrieve the User model. */

/*NOTE:
So, whatever is attached to the res.locals object in Express gets passed to the rendered EJS view automatically.
In this, we use it to pass the flash message to any rendered EJS view, so we can show it on the 
page when it's loaded in the browser (i.e. when a flash message happens). */
app.use((req, res, next) => {
  // console.log(req.session);
  res.locals.success = req.flash("success"); //we will have access to this in out templates (show route in campground.js) automatically
  //on every single request, we take whatever is under flash('success') and have access to it under locals under the key success (locals.success)
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user; //this is referring to the current user if logged in or registered in
  next();
});

//for manually registering, (not the way it should be done, but just to check)
app.get("/fakeUser", async (req, res) => {
  const user = new User({ email: "anii@gmail.com", username: "anii" });
  const newUser = await User.register(user, "cats"); //done through the help of passport, take entire 'user' model as instance and then a password, hash it(salt it) and store
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

//FOR ROUTER OF CAMPGROUNDS and REVIEWS and USERS
app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes); //NOTE: we have /:id also in the route, hence we must use mergeParams in reviews.js

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
