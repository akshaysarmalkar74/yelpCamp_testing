const express = require("express");
const router = express.Router();
const User = require("../models/user");
const catchAsync = require("../utils/catchAsync");
const passport = require("passport");
const { storeReturnTo } = require("../middleware"); //from middleware.js

router.get("/register", (req, res) => {
  res.render("users/register");
});

router.post(
  "/register",
  catchAsync(async (req, res) => {
    try {
      const { email, username, password } = req.body;
      const user = new User({ email, username });
      const registeredUser = await User.register(user, password); //this is from passport, hashes and salts it. and also User.save() is done automatically through it, no need to specify
      //below is basically a passport quirk where it lets you see stuff that you couldn't see while you 'register'(we cannot see isLoggedIn stuff without actually logging in, not registering)
      // because you were not 'logged in' so basically the passport makes it so that you can view it as if you are logged in even though you registered just now.
      req.login(registeredUser, (err) => {
        if (err) return next(err);
        req.flash("success", "Welcome to yelpCamp");
        res.redirect("/campgrounds");
      });
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("/register");
    }
  })
);

router.get("/login", (req, res) => {
  res.render("users/login");
});

//we use passport to easily do this
router.post(
  "/login",
  // use the storeReturnTo middleware to save the returnTo value from session to res.locals
  storeReturnTo,
  // passport.authenticate logs the user in and clears req.session
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  // Now we can use res.locals.returnTo to redirect the user after login
  (req, res) => {
    req.flash("success", "Welcome back!");
    const redirectUrl = res.locals.returnTo || "/campgrounds"; // update this line to use res.locals.returnTo now
    delete req.session.returnTo; //we dont want the returnTo variable just to sit in the session after you go to that page, so we delete it after you enter that page
    res.redirect(redirectUrl);
  }
);
/*NOTE FOR ABOVE:
By using the storeReturnTo middleware function, we can save the returnTo value to res.locals before passport.authenticate() clears the 
session and deletes req.session.returnTo. This enables us to access and use the returnTo value (via res.locals.returnTo) 
later in the middleware chain so that we can redirect users to the appropriate page after they have logged in. */

//through the help of passport
router.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash("success", "Successfully logged out");
    res.redirect("/campgrounds");
  });
});

module.exports = router;
