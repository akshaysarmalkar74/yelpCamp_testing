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
