const mongoose = require("mongoose");

const schemeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    documents: {
      type: Object,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
schemeSchema.index({ name: "text", documents: "text" });
module.exports = mongoose.model("Scheme", schemeSchema);
