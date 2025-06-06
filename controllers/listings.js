const Listing = require("../models/listing.js");

const maptilerClient = require('@maptiler/client');
const mapToken = process.env.MAP_TOKEN;
maptilerClient.config.apiKey = mapToken;

module.exports.index = async (req, res) =>{
    let allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.createNewListing = async (req, res, next) => {
    //Getting map coordinates
    const result = await maptilerClient.geocoding.forward(req.body.listing.location, {limit:1});
    let newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    console.log(result);

    if(req.file){
        let url = req.file.path;
        let filename = req.file.filename;
        newListing.image = {filename, url};
    }
    if(!result){
        req.flash("error", "Enter a valid Location");
        res.redirect("/listings/new");
        return;
    }
    newListing.geometry = result.features[0].geometry;
    await newListing.save();
    // console.log(savedListing);
    req.flash("success", "New listing created");
    res.redirect("/listings");
};

module.exports.showListing = async (req, res, next) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({path: "reviews", populate : { path: "author"}}).populate("owner");
    if(!listing){
        req.flash("error", "Listing does not exist");
        res.redirect("/listings");
    }else{
        res.render("listings/show.ejs", {listing});
    }
};

module.exports.renderUpdateForm = async (req, res) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing does not exist");
        res.redirect("/listings");
    }else{
        let originalImageUrl = listing.image.url;
        originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_300");
        res.render("listings/edit.ejs", {listing, originalImageUrl});
    }
};

module.exports.updateListing = async (req, res) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.currUser._id)){
        req.flash("error", "Access denied");
        return res.redirect(`/listings/${id}`);
    }

    let newListing = await Listing.findByIdAndUpdate(id, {...req.body.listing});
    const result = await maptilerClient.geocoding.forward(req.body.listing.location, {limit:1});
    if(req.file){
        let url = req.file.path;
        let filename = req.file.filename;
        newListing.image = {filename, url};
    }
    newListing.geometry = result.features[0].geometry;
    await newListing.save();
    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
    let{id} = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted");
    res.redirect("/listings");
};