const BaseJoi = require("joi");
const sanitizeHtml = require("sanitize-html");

//we are doing the following for validations/basically creating a method for sanitizing html.
//THIS is an EXTENSION on joi itself not any new package but it uses inside another package that was installed called sanitizeHTML
const extension = (joi) => ({
  type: "string",
  base: joi.string(), //we find an extension on joi.string() called escapeHTML which is below
  messages: {
    "string.escapeHTML": "{{#label}} must not include HTML!", //error message to see when the error is encountered
  },
  rules: {
    escapeHTML: {
      validate(value, helpers) {
        //escapeHTML: must include a function called validate(), joi will call it automatically with whatever the value is that it receives
        const clean = sanitizeHtml(value, {
          // a package called sanitizeHtml is used for sanitizing of HTML inputs...you pass somthing and it strips the html tags away.
          allowedTags: [], //we are providing options for tags here..that [] can be used..which is nothing
          allowedAttributes: {}, //we are providing options for attributes here..that [] can be used..which is nothing
        });
        if (clean !== value)
          //here above in the condition we check between the input that was passed in and the sanitized value and if there is a difference then do below
          return helpers.error("string.escapeHTML", { value });
        return clean;
      },
    },
  },
});

const Joi = BaseJoi.extend(extension); //now Joi is also present which is used below extended from the BaseJoi

module.exports.campgroundSchema = Joi.object({
  //we are expecting it to be an object below and also to be required()
  campground: Joi.object({
    title: Joi.string().required().escapeHTML(),
    price: Joi.number().required().min(0), //no negative minimum is only 0
    //NOTE: we are not including image to be validated for the moment because we encounter problem while we upload image to cloudinary
    //image: Joi.string().required(),
    location: Joi.string().required().escapeHTML(),
    description: Joi.string().required().escapeHTML(),
  }).required(), //note that we are sending everything under the key of campground..example campground[price] and so on
  deleteImages: Joi.array(),
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    body: Joi.string().required().escapeHTML(),
  }).required(),
});
