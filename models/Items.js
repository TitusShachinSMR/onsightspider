const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String },
  images: [{ type: String }],
  starting_price: { type: Number, required: true },
  auction_duration: { type: Number, required: true },
  category: { type: String },
  created_at: { type: Date, default: Date.now },
});

const Item = mongoose.model("Item", itemSchema);
module.exports = Item;
