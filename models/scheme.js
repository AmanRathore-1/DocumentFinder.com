const mongoose = require("mongoose");

const schemeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  documents: {
    type: Object,
    required: true
  }
});

module.exports = mongoose.model("Scheme", schemeSchema);
