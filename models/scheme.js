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

  //adding Information , last date to apply 
});

module.exports = mongoose.model("Scheme", schemeSchema);
