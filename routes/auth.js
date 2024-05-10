var express = require("express");
var router = express.Router();
const { check } = require("express-validator");
const { signout, signup, signin, resetPasswordIntitiate, resetPassword, resetPasswordSet, googleSignin, googleSignout } = require("../controllers/auth");
const multer = require("multer");
const oAuth2Client = require("../utils/googleAuth");
const { isSignedIn } = require("../middlewares/auth");
const upload = multer({ dest: 'uploads/' });

// JWT Auth Routes

router.post(
  "/signup",
  [
    check("name", "name should be at least 3 char").isLength({ min: 3 }),
    check("email", "email is required").isEmail(),
    check("password", "password should be at least 4 char").isLength({ min: 4 }),
    check("username", "username should be at least 3 char").isLength({ min: 3 }),
    check("image").optional()
  ],
  upload.single("image"),
  signup
);

router.post(
  "/signin",
  [
    check("username", "username is required").isLength({ min: 3 }),
    check("password", "password field is required").isLength({ min: 4 })
  ],
  signin
);

router.get("/signout", signout);

router.post(
  "/resetpassword", 
  [
    check("email", "email is required").isEmail()
  ],
  resetPasswordIntitiate
)

router.post(
  "/resetpasswordSet",
  [
    check("password", "password should be at least 8 char").isLength({ min: 8 }),
    check("token", "token is required").isLength({ min: 1 })
  ],
  resetPasswordSet
)

router.get("/resetpassword", resetPassword)

// Google Auth Routes

router.get('/auth/google', (req, res) => {
  const url = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'],
  });
  res.redirect(url);
});

router.get('/auth/google/callback', googleSignin);

router.post('/auth/google/signout', isSignedIn, googleSignout);

module.exports = router;