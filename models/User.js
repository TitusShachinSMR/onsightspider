const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password_hash: { type: String },
  googleId: { type: String },
  role: { type: String, enum: ["buyer", "seller"], required: true },
  email_verified: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
});

// hashing the password
userSchema.pre("save", async function (next) {
  if (this.isModified("password_hash")) {
    this.password_hash = bcrypt.hash(this.password_hash, 10);
  }
  next();
});

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password_hash);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
