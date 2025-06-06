const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const ExpressError = require("../utils/ExpressError.js");
const listingController = require("../controllers/listings.js");
const multer  = require('multer');
const {storage} = require('../cloudConfig.js');
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB max
});

//Index route
router.get("/", wrapAsync(listingController.index));

//Create new route
router.get("/new", isLoggedIn, listingController.renderNewForm);
router.post("/", isLoggedIn, validateListing, upload.single('listing[image]'), wrapAsync(listingController.createNewListing));

//Show route
router.get("/:id", wrapAsync(listingController.showListing));

//Update route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderUpdateForm));
router.put("/:id", validateListing, upload.single('listing[image]'), isLoggedIn, isOwner, wrapAsync(listingController.updateListing));

//Delete route
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));

module.exports = router;