var express = require("express");
var router = express.Router();
const multer = require("multer");
const upload = multer({ dest: 'uploads/' });

const { isSignedIn, getUserById, isAdmin, isAuthenticated } = require("../middlewares/auth");
const { getUserProfile, getSelfProfile, getAllUsers, switchProfileStatus, updateUserProfile } = require("../controllers/user");
const { check } = require("express-validator");

router.param("userId", getUserById);

router.get("/profile/all", isSignedIn, isAdmin, getAllUsers)
router.get("/profile/self", isSignedIn, getSelfProfile)
router.get("/profile/other/:userId", isSignedIn, getUserProfile)
router.patch("/profile/switch/visibility/:userId", isSignedIn, switchProfileStatus)
router.put(
    "/profile/update/:userId", 
    [
        check("name", "name should be at least 3 char").isLength({ min: 3 }),
        check("email", "email is required").isEmail(),
        check("username", "username should be at least 3 char").isLength({ min: 3 }),
        check("image").optional()
    ],
    upload.single("image"),
    isSignedIn, isAuthenticated, 
    updateUserProfile
)

module.exports = router;
