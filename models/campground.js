const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema;

const CampgroundSchema = new mongoose.Schema({
  title: String,
  image: String,
  price: Number,
  description: String,
  location: String,
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
