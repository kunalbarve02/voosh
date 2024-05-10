const User = require("../models/user");
const ForgotPassword = require("../models/forgotPassword");
const { validationResult } = require("express-validator");
var jwt = require("jsonwebtoken");
const uuid = require('uuid/v4');
const { sendEmail } = require("../utils/sendEmail");
const path = require('path');
const crypto = require("crypto");
const logger = require("../logger");
const cloudinary = require('../utils/upload');
const oAuth2Client = require("../utils/googleAuth");

exports.signup = async (req, res) => {
  const errors = validationResult(req.body);

  if (!errors.isEmpty()) {
    logger.error(errors.array());
    return res.status(400).json({
      error: errors.array()
    });
  }

  let imageUrl

  if(req?.file) {
    await cloudinary.uploader.upload(req.file.path, {
      public_id: `user/${req.body.username}`,
    })
    .then((result)=>{
      imageUrl = result.secure_url
    })
    .catch((error)=>{console.log(error)});
  }

  const userData = {
    ...req.body,
    photo: imageUrl
  }

  const user = new User(userData);
  user.save((err, user) => {
    if (err) {
      logger.error(err);
      console.log(err)
      return res.status(500).json({
        err: "NOT able to save user in DB"
      });
    }

    const token = jwt.sign({ _id: user._id, role:user.role }, process.env.SECRET);
    res.cookie("token", token, { expire: new Date() + 9999 });
    logger.info("User created successfully");
    res.status(200).json({
      name: user.name,
      email: user.email,
      username: user.username,
      id: user._id,
      token,
      isPublic: user.isPublic,
      photo: user.photo
    });
  });
};

exports.signin = (req, res) => {
  const errors = validationResult(req);
  const { username, password } = req.body;

  if (!errors.isEmpty()) {
    logger.error(errors.array()[0].msg);
    return res.status(400).json({
      error: errors.array()[0].msg
    });
  }

  User.findOne({ username })
    .then(user => {
      if (!user) { 
        logger.error("Username does not exists");
        return res.status(400).json({
          error: "Username does not exists"
        });
      }
  
      if (!user.autheticate(password)) {
        logger.error("Username and password do not match");
        return res.status(401).json({
          error: "Username and password do not match"
        });
      }
  
      const token = jwt.sign({ _id: user._id, role:user.role }, process.env.SECRET);
      res.cookie("token", token, { expire: new Date() + 9999 });
  
      const { _id, name, email, username, isPublic } = user;
      logger.info("User signed in successfully");
      return res.json({ user: { id:_id, name, email, token, username, isPublic } });
    })
    .catch(err => {
      console.log(err);
      return res.status(400).json({
        error: "Username does not exists"
      });
    }
  );
};

exports.signout = (req, res) => {
  res.clearCookie("token");
  res.json({
    message: "User signout successfully"
  });
  logger.info("User signout successfully");
};

exports.resetPasswordIntitiate = async(req, res) => {
  
  const { email } = req.body;
  console.log(email);

try {
    const user = await User.findOne({ email })
    if(!user) {
      logger.error("User with this Email does not exists");
      return res.status(400).json({
        error: "User with this Email does not exists"
      });
    }
    const resetToken = uuid();
    const forgotPassword = new ForgotPassword({ userId:user._id, resetToken });
    await forgotPassword.save()
  
    const link = `http://localhost:8000/api/resetpassword?token=${resetToken}`;
    await sendEmail(email, "Reset Password", link);
  
    logger.info("Reset Password link has been sent to your email");
    return res.status(200).json({
      message: "Reset Password link has been sent to your email"
    });
  } 
  catch (error) {
    logger.error(error);
    return res.status(500).json({
      error: "Something went wrong"
    });
  }
};

exports.resetPassword = async(req, res) => {
  res.sendFile('resetPassword.html', { root: path.join(__dirname, '../views') });
};

exports.resetPasswordSet = async(req, res) => {
  let { token, password } = req.body;

  try{
    const isTokenValid = await ForgotPassword
    .findOne({ resetToken:token })
    .populate('userId', '_id, salt')
    if(!isTokenValid) {
      return res.status(400).json({
        error: "Invalid Token"
      });
    }
    const salt = await uuid();
    password = await crypto.createHmac("sha256", salt).update(password).digest("hex")
    await User.findByIdAndUpdate(isTokenValid.userId._id, { salt:salt ,encry_password: password }, { new: true })
    await ForgotPassword.deleteOne({ resetToken:token })
    res.status(200).json({
      status:true,
      message: "Password reset successfully"
    });
  }
  catch(error) {
    console.log(error);
    return res.status(500).json({
      error: "Something went wrong"
    });
  }
};

exports.googleSignin = async(req, res) => {
  const { code } = req.query;
  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);

  const ticket = await oAuth2Client.verifyIdToken({
    idToken: tokens.id_token,
    audience: process.env.OAuthClientID,
  });

  const payload = ticket.getPayload();
  
  const userData = {
    name: payload.name,
    email: payload.email,
    username: payload.email.split('@')[0],
    photo: payload.picture,
    googleAccessToken: tokens.access_token,
    googleRefreshToken: tokens.refresh_token
  }

  let user = await User.findOne({ email: userData.email });
  if (!user) {
    user = new User(userData);
    await user.save();
  }
  const token = jwt.sign({ _id: user._id, role:user.role }, process.env.SECRET);
  res.cookie("token", token, { expire: new Date() + 9999 });
  res.status(200).json({
    id: user._id,
    name: user.name,
    email: user.email,
    username: user.username,
    id: user._id,
    token,
    isPublic: user.isPublic,
    photo: user.photo,
    token
  });
};

exports.googleSignout = async(req, res) => {
  try{
    let userTokens = await User.findById(req.auth._id).select('googleAccessToken googleRefreshToken');
    if(userTokens.googleAccessToken) {
      await oAuth2Client.revokeToken(userTokens.googleAccessToken);
    }
    if(userTokens.googleRefreshToken) {
      await oAuth2Client.revokeToken(userTokens.googleRefreshToken);
    }
    await User.findByIdAndUpdate(req.auth._id, { googleAccessToken:"", googleRefreshToken:"" });

    res.clearCookie("token");
    res.status(200).json({
      message: "User signed out successfully"
    });
  }
  catch(error) {
    logger(error);
    return res.status(500).json({
      error: "Something went wrong"
    });
  }
}
