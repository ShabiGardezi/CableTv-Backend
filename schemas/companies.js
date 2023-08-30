const mongoose = require("mongoose");

const ComapanySchema = new mongoose.Schema({
  CompanyName: {
    type: String,
    required: true,
  },
  MaxDownloadSpeedsUpTo: {
    type: String,
  },
  Features: [],

  rating: {
    type: String,
  },
  Price: {
    type: Number,
    required: true,
  },

  zipcodes: [],

  Channels: {
    type: String,
  },
  Category: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Companies", ComapanySchema);
