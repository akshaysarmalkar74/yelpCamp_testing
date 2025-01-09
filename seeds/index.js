const mongoose = require("mongoose");
const axios = require("axios");
const Campground = require("../models/campground");
const Review = require("../models/review");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");

mongoose
  .connect("mongodb://127.0.0.1:27017/yelp-camp")
  .then(() => {
    console.log("MONGO CONNECTED!");
  })
  .catch((err) => {
    console.log("THERE WAS AN ERROR ON MONGO", err);
  });

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  await Review.deleteMany({});
  for (let i = 0; i < 300; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      author: "6766bcf3abd2fb171b0c997a", //all campgrounds have only one ID, that is one creator which is hardoded here. Which is basically myself, ani.
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      images: [
        {
          url: "https://res.cloudinary.com/deedvudwx/image/upload/v1736004228/YelpCamp/bfefzfvcrnzfjepkkt9s.jpg",
          filename: "YelpCamp/bfefzfvcrnzfjepkkt9s",
        },
        {
          url: "https://res.cloudinary.com/deedvudwx/image/upload/v1736004228/YelpCamp/ruuxad2hhmyomva2qndw.jpg",
          filename: "YelpCamp/ruuxad2hhmyomva2qndw",
        },
      ],

      description:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Rem totam, hic, repellat ipsum tempore consectetur eos officiis necessitatibus impedit error dicta sapiente quod nesciunt, vitae odit quas. Aliquid, illo autem?",
      price, //short hand instead of price:price
      geometry: {
        type: "Point",
        coordinates: [
          cities[random1000].longitude, //longitude first and latitude next for geoJson...its just the way it works
          cities[random1000].latitude,
        ],
      }, //we are hardcoding the geometry here because it shows error otherwise, if the location entered is something that does not exist...or any as such..then this is the default
    });
    await camp.save();
  }
};

// call unsplash and return small image
async function seedImg() {
  try {
    const resp = await axios.get("https://api.unsplash.com/photos/random", {
      params: {
        client_id: "tuFbT24bB7aSenE0KaNpgioEJKFNTffbUjeLaZY4_Pk",
        collections: 1114848,
      },
    });
    return resp.data.urls.small;
  } catch (err) {
    console.error(err);
  }
}

seedDB().then(() => {
  mongoose.connection.close();
});
