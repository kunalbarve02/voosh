const cloudinary = require('cloudinary').v2;

cloudinary.config({ 
    cloud_name: "kunalbarve", 
    api_key: "616617784529797", 
    api_secret: "fACUvKTXdivNOGJAbpLEtnudGsU"
});

module.exports = cloudinary;