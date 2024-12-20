const express = require("express");
const router = express.Router();
const User = require("../models/user");
const catchAsync = require("../utils/catchAsync");
const passport = require("passport");

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
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  (req, res) => {
    req.flash("success", "Welcome Back!");
    res.redirect("/campgrounds");
  }
);

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
