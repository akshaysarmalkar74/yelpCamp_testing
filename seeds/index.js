const mongoose = require("mongoose");
const axios = require("axios");
const Campground = require("../models/campground");
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
  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      image: await seedImg(),
      description:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Rem totam, hic, repellat ipsum tempore consectetur eos officiis necessitatibus impedit error dicta sapiente quod nesciunt, vitae odit quas. Aliquid, illo autem?",
      price, //short hand instead of price:price
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
