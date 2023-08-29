const mongoose = require("mongoose");

const PagesSchema = new mongoose.Schema({});
module.exports = mongoose.model("page", PagesSchema);
