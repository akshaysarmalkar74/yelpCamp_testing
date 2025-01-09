const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
  url: String,
  filename: String,
});

ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
}); //the reason we use a virtual, we don't need to store this on our model or in the database. It is dervied from the information we're already storing.
//basically this is what happens to the URL: https://res.cloudinary.com/deedvudwx/image/upload/w_200/v1736004228/YelpCamp/ruuxad2hhmyomva2qndw.jpg

const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new mongoose.Schema(
  {
    title: String,
    //other images is removed due to the below line
    images: [ImageSchema],
    price: Number,
    description: String,
    location: String,
    //below is added as we are geocoding now
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    //below is added only after reviews (below) accordingly to lecture
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    // below is added later after creating review.js model, one campoground has many reviews
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  opts
);

//we are making the below so that we can access it in index.ejs and clusterMap
CampgroundSchema.virtual("properties.popUpMarkup").get(function () {
  //return `I AM POPUP TEXT`; //.popUpMarkup is nested in properties
  return `<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>`;
}); //this will show as a part of the page, but it wont get the mongoose virtual as part of the result object on the console, so we cant extract it, because its default is as such...hence we use 'opt' above

//for deleting reviews as well when we delete campground...we use the mongoose middleware as follows, use findOneAndDelete.

CampgroundSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    //this document has reviews, we will delete all reviews where their id field is in our document(doc) that was just deleted
    await Review.deleteMany({
      //id for each review is somewhere in document.reviews
      _id: {
        $in: doc.reviews,
      },
    });
  }
});

module.exports = mongoose.model("Campground", CampgroundSchema);
