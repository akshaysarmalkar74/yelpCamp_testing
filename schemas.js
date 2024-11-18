const Joi = require("joi");

module.exports.campgroundSchema = Joi.object({
  //we are expecting it to be an object below and also to be required()
  campground: Joi.object({
    title: Joi.string().required(),
    price: Joi.number().required().min(0), //no negative minimum is only 0
    image: Joi.string().required(),
    location: Joi.string().required(),
    description: Joi.string().required(),
  }).required(), //note that we are sending everything under the key of campground..example campground[price] and so on
});
