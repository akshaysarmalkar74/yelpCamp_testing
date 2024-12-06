const mongoose = require("mongoose");
const schema = mongoose.Schema;

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

module.exports = mongoose.model("Campground", CampgroundSchema);
