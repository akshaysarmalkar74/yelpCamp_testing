const Joi = require("joi");

module.exports.campgroundSchema = Joi.object({
  //we are expecting it to be an object below and also to be required()
  campground: Joi.object({
    title: Joi.string().required(),
    price: Joi.number().required().min(0), //no negative minimum is only 0
    //NOTE: we are not including image to be validated for the moment because we encounter problem while we upload image to cloudinary
    //image: Joi.string().required(),
    location: Joi.string().required(),
    description: Joi.string().required(),
  }).required(), //note that we are sending everything under the key of campground..example campground[price] and so on
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    body: Joi.string().required(),
  }).required(),
});
