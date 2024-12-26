const express = require("express");
const router = express.Router();
const User = require("../models/user");
const catchAsync = require("../utils/catchAsync");
const passport = require("passport");
const users = require("../controllers/users");
const { storeReturnTo } = require("../middleware"); //from middleware.js

router
  .route("/register")
  .get(users.renderRegister)
  .post(catchAsync(users.register));

router
  .route("/login")
  .get(users.renderLogin)
  //we use passport to easily do this below
  .post(
    // use the storeReturnTo middleware to save the returnTo value from session to res.locals
    storeReturnTo,
    // passport.authenticate logs the user in and clears req.session
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    users.login
  );

/*NOTE FOR ABOVE:
By using the storeReturnTo middleware function, we can save the returnTo value to res.locals before passport.authenticate() clears the 
session and deletes req.session.returnTo. This enables us to access and use the returnTo value (via res.locals.returnTo) 
later in the middleware chain so that we can redirect users to the appropriate page after they have logged in. */

//through the help of passport
router.get("/logout", users.logout);

module.exports = router;
