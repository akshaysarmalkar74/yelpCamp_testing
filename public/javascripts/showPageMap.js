maptilersdk.config.apiKey = maptilerApiKey;

const map = new maptilersdk.Map({
  container: "map",
  style: maptilersdk.MapStyle.BRIGHT,
  center: [-74.5, 40], // starting position [lng, lat]
  zoom: 10, // starting zoom
});
