const mongoose = require("mongoose");

var forgotPasswordSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    resetToken: {
      type: String,
      required: true
    },
    expireToken: {
      type: Date,
      required: true,
      default: Date.now,
    }
});

module.exports = mongoose.model("ForgotPassword", forgotPasswordSchema);
