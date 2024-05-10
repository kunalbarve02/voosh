const logger = require("../logger");
const User = require("../models/user");
const { validationResult } = require("express-validator");
const cloudinary = require('../utils/upload')

exports.getUserProfile = async(req, res) => {
    let userId = req.params.userId

    if(!userId) {
        logger.error("User not found");
        return res.status(404).json({
            error: "User not found"
        });
    }

    try{
        var user = await User.findById(userId)
        .select("-encry_password -salt -googleAccessToken -googleRefreshToken")
        if(!user) {
            logger.error("User not found");
            return res.status(404).json({
                error: "User not found"
            });
        }

        if(!user.isPublic && req.auth._id !== userId && req.auth.role !== 1) {
            logger.error("User is not public");
            return res.status(403).json({
                error: "User is not public"
            });
        }

        logger.info("User found");
        return res.json({
            status: true,
            user
        });
    }catch(err) {
        logger.error(err);
        return res.status(500).json({
            status: false,
            error: "Something went wrong"
        });
    }
}

exports.getSelfProfile = async(req, res) => {
    try {
        console.log(req.auth)
        const userData = await User.findById(req.auth._id)
        .select("-encry_password -salt -googleAccessToken -googleRefreshToken")
        logger.info("User found");
        return res.json({
            status: true,
            user: userData
        })
    } catch (error) {
        logger.error(error);
        return res.status(500).json({
            status: false,
            error: "Something went wrong"
        })
    }

}

exports.getAllUsers = async(req, res) => {
    try{
        var users = await User.find()
        .select("-encry_password -salt")
    }catch(err) {
        logger.error("Users not found");
        return res.status(400).json({
            error: "Users not found"
        });
    }
    logger.info("Users found");
    return res.json({
        status: true,
        users
    });
}

exports.switchProfileStatus = async(req, res) => {

    let userId = req.auth._id

    try{

        var user = await User.findById(userId)
        .select("isPublic")
        if(!user) {
            logger.error("User not found");
            return res.status(404).json({
                error: "User not found"
            });
        }

        const isPublic = !user.isPublic

        User.findByIdAndUpdate(userId, { isPublic }, { new: true })
        .then(user => {
            logger.info("User status updated");
            return res.json({
                status: true,
                user
            });
        })
        .catch(err => {
            logger.error(err);
            return res.status(500).json({
                status: false,
                error: "Something went wrong"
            });
        })


    }
    catch(err) {
        logger.error(err);
        return res.status(500).json({
            status: false,
            error: "Something went wrong"
        });
    }

}

exports.updateUserProfile = async(req, res) => {
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
      .catch((error)=>{
        logger.error(error);
        return res.send("Error in uploading image")
      });
    }
  
    let userData = {
      ...req.body,
      photo: imageUrl
    }

    let userId = req.auth._id

    try{
        userData = await User.findByIdAndUpdate(userId, userData, { new: true })
        .select("-encry_password -salt")
        return res.json({
            status: true,
            user: userData
        });
    }
    catch(err) {
        logger.error(err);
        if(err.code === 11000) {
            return res.status(400).json({
                status: false,
                error: "Username or email already exists"
            });
        }
        return res.status(500).json({
            status: false,
            error: err.message
        });
    }

}
