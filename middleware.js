module.exports.isLoggedIn = (req, res, next) => {
  console.log("REQ.USER", req.user); //req.user is coming from the session, which is deserialised to give back who the user is that is stored
  //above gives back id, username and email
  if (!req.isAuthenticated()) {
    //basically we do the following if we still aren't authenticated but try to hit this route still
    //isAuthenticated() is coming from passport
    req.flash("error", "You must be signed in");
    return res.redirect("/login");
  }
  next();
};
