const mongoose = require("mongoose");

const PagesSchema = new mongoose.Schema({
  Home: {},
  AboutUs: {},
  Services: {},
  ServiceProviders: {},
  ContactUs: {},
  PrivacyPolicy: {},
  CableTv_Section: {},
  CableInternet_Section: {},
  SatelliteInternet_Section: {},
  SatelliteTv_Section: {},
});
module.exports = mongoose.model("page", PagesSchema);
