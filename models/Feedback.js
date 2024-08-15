const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Auction",
    required: true,
  },
  giver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  rating: { type: Number, min: 1, max: 5, required: true },
  comments: { type: String },
  created_at: { type: Date, default: Date.now },
});

const Feedback = mongoose.model("Feedback", feedbackSchema);
module.exports = Feedback;
