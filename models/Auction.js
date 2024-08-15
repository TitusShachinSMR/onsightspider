const mongoose = require("mongoose");

const auctionSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
  start_time: { type: Date, required: true },
  end_time: { type: Date, required: true },
  current_highest_bid: { type: Number, default: 0 },
  current_highest_bidder: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: {
    type: String,
    enum: ["pending", "active", "completed", "cancelled"],
    required: true,
  },
});

const Auction = mongoose.model("Auction", auctionSchema);
module.exports = Auction;
