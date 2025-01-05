const Campground = require("../models/campground");
const { cloudinary } = require("../cloudinary");
const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
  /* below is moved to middleware.js as isLoggedIn */
  // if (!req.isAuthenticated()) {
  //   //basically we do the following if we still aren't authenticated but try to hit this route still
  //   //isAuthenticated() is coming from passport
  //   req.flash("error", "You must be signed in");
  //   return res.redirect("/login");
  // }
  res.render("campgrounds/new");
};

module.exports.createCampground = async (req, res, next) => {
  //if (!req.body.campground) throw new ExpressError("Invalid Campground", 400); //we do this so that if a person tries to create a campground using just html or postman...
  //For using Joi we define basic schema, note that this is not a mongoose schema..but something that is evaluated before that
  //can be checked using POSTMAN and setting key to campground[price] and so on as defined below
  // const campgroundSchema = Joi.object({
  //   //we are expecting it to be an object below and also to be required()
  //   campground: Joi.object({
  //     title: Joi.string().required(),
  //     price: Joi.number().required().min(0), //no negative minimum is only 0
  //     image: Joi.string().required(),
  //     location: Joi.string().required(),
  //     description: Joi.string().required(),
  //   }).required(), //note that we are sending everything under the key of campground..example campground[price] and so on
  // });
  // const { error } = campgroundSchema.validate(req.body);
  // if (error) {
  //   const msg = error.details.map((el) => el.message).join(","); //.map creates a new array populated with the results of the function that is called inside with the elements of that array.
  //   //basically without an arrow function: error.details.map(function(el){return el.message})//which gives an array of strings which is joined by , commas.
  //   throw new ExpressError(msg, 400);
  // }
  //console.log(result);
  const geoData = await maptilerClient.geocoding.forward(
    req.body.campground.location,
    { limit: 1 }
  );
  const campground = new Campground(req.body.campground);
  campground.geometry = geoData.features[0].geometry; //we get back a geoJson format when this is res.send(geoData.features[0].geometry), and we have type set to Point always
  campground.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  })); //we are getting req.files from multer middleware, and through that we map/get an array of stuff that it has and we take path and filename out of it
  campground.author = req.user._id; //comes from auth
  await campground.save();
  console.log(campground);
  req.flash("success", "Successfully made a campground!");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground = async (req, res) => {
  const campground = await Campground.findById(req.params.id)
    .populate({
      path: "reviews", //shows all reviews, must also be done on show.ejs
      populate: { path: "author" }, //shows the name of the author that has reviewed.
    })
    .populate("author"); //make sure author is also viewable not just id(as seen in relationships/ one to many and stuff), but still have to 'show' it in show.ejs
  //If the campground did not find that particular one with that ID flash the below error and redirect-can happen when yo
  // u copy paste a deleted route of a campground
  if (!campground) {
    req.flash("error", "Campground does not exist");
    res.redirect("/campgrounds");
  }
  res.render("campgrounds/show", { campground });
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground) {
    req.flash("error", "Campground does not exist, cannot edit!");
    res.redirect("/campgrounds");
  }
  res.render("campgrounds/edit", { campground });
};

module.exports.updateCampground = async (req, res) => {
  const { id } = req.params;
  console.log(req.body);
  const campground = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  }); //spread operator instead of keeping it in one line it spreads into different ones like -
  //{
  //title:
  //location:
  //}
  //
  const geoData = await maptilerClient.geocoding.forward(
    req.body.campground.location,
    { limit: 1 }
  );
  campground.geometry = geoData.features[0].geometry;
  const imgs = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  campground.images.push(...imgs); //we do not directly push it in the above code because we cannot push an array to another array, rather we take something from the above array and push it in this line.
  await campground.save();
  //if there are any images to delete, do below condition...first we delete from cloudinary and then 'update'...which we can see on show page where those images are deleted.
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename); //there's a method called destroy on uploader, pass the filename and it should delete that particular file
    }
    await campground.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    }); //pulling elements out of an array, out of images array, filename of each image is in the req.body.deleteImages
    console.log(campground);
  }
  req.flash("success", "Successfully updated camground!");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted campground");
  res.redirect("/campgrounds");
};
