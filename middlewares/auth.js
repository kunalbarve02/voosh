const User = require("../models/user");
const { expressjwt: expressJwt } = require('express-jwt');

exports.isSignedIn = expressJwt({
    secret: process.env.SECRET,
    userProperty: "auth",
    algorithms: ["HS256"]
  })
  
  exports.isAuthenticated = (req, res, next) => {
    let checker = req.profile && req.auth && req.profile._id == req.auth._id;
    if (!checker) {
      return res.status(403).json({
        error: "ACCESS DENIED"
      });
    }
    next();
  };
  
  exports.getUserById = (req, res, next, id) => {
    User.findById(id).exec((err, user) => {
        if (err || !user) {
        return res.status(404).json({
            error: "No user was found in DB"
        });
        }
        req.profile = user;
        next();
    });
  };

  exports.isAdmin = (req, res, next) => {
    console.log(req.auth.role);
    if(req.auth.role !== 1) {
      return res.status(403).json({
        error: "You are not an admin"
      });
    }
    if(req.auth.role === 1) 
        next();
}
  