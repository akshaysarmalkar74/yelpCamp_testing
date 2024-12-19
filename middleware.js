module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    //basically we do the following if we still aren't authenticated but try to hit this route still
    //isAuthenticated() is coming from passport
    req.flash("error", "You must be signed in");
    return res.redirect("/login");
  }
  next();
};
