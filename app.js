const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const app = express();
const Campground = require("./models/campground");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

mongoose
  .connect("mongodb://127.0.0.1:27017/yelp-camp")
  .then(() => {
    console.log("MONGO CONNECTED!");
  })
  .catch((err) => {
    console.log("THERE WAS AN ERROR ON MONGO", err);
  });

// app.get("/makecampground", async (req, res) => {
//   const camp = new Campground({
//     title: "My Backyard",
//     description: "cheap camping",
//   });
//   await camp.save();
//   res.send(camp);
// });

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/campgrounds", async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
});

app.get("/campgrounds/:id", async (req, res) => {
  const campgrounds = await Campground.findById(req.params.id);
  res.render("campgrounds/show", { campgrounds });
});

app.listen(3000, () => {
  console.log("listening on port 3000");
});
