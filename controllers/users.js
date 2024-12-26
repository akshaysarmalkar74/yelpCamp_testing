const User = require("../models/user");

module.exports.renderRegister = (req, res) => {
  res.render("users/register");
};

module.exports.register = async (req, res) => {
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
};

module.exports.renderLogin = (req, res) => {
  res.render("users/login");
};

module.exports.login =
  // Now we can use res.locals.returnTo to redirect the user after login
  (req, res) => {
    req.flash("success", "Welcome back!");
    const redirectUrl = res.locals.returnTo || "/campgrounds"; // update this line to use res.locals.returnTo now
    delete req.session.returnTo; //we dont want the returnTo variable just to sit in the session after you go to that page, so we delete it after you enter that page
    res.redirect(redirectUrl);
  };

module.exports.logout = (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash("success", "Successfully logged out");
    res.redirect("/campgrounds");
  });
};
