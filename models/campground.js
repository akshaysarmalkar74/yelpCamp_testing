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

const CampgroundSchema = new mongoose.Schema({
  title: String,
  images: [
    {
      url: String,
      filename: String,
    },
  ],
  images: [ImageSchema],
  price: Number,
  description: String,
  location: String,
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
});

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
