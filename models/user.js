var mongoose = require("mongoose");
const crypto = require("crypto");
const uuid = require("uuid/v4");

var userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 32,
      trim: true
    },
    lastname: {
      type: String,
      maxlength: 32,
      trim: true
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 200,
      default: ""
    },
    encry_password: {
      type: String,
      required: false
    },
    salt: String,
    role: {
      type: Number,
      default: 0
    },
    isPublic: {
      type: Boolean,
      default: true
    },
    photo:{
      type : String,
    },
    googleAccessToken: {
      type: String,
      default: ""
    },
    googleRefreshToken: {
      type: String,
      default: ""
    },
  },
  { timestamps: true }
);

// Schema methods for password encryption and authentication
userSchema
  .virtual("password")
  .set(function(password) {
    this._password = password;
    this.salt = uuid();
    this.encry_password = this.securePassword(password);
  })
  .get(function() {
    return this._password;
  });

userSchema.methods = {
  autheticate: function(plainpassword) {
    return this.securePassword(plainpassword) === this.encry_password;
  },

  securePassword: function(plainpassword) {
    if (!plainpassword) return "";
    try {
      return crypto
        .createHmac("sha256", this.salt)
        .update(plainpassword)
        .digest("hex");
    } catch (err) {
      return "";
    }
  }
};

module.exports = mongoose.model("User", userSchema);
