var express 	 = require("express");
var router  	 = express.Router();
var eventObject  = require("../models/events.js");
var	photoObject  = require("../models/photos.js")
var middleware   = require("../middleware/index.js");


// ========  MULTER & CLOUDINARY CONFIG ==================== //
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});

var cloudinary = require("cloudinary").v2;
cloudinary.config({ 
  cloud_name: 'isaqshoots', 
  api_key: process.env.CLOUDINARY_api_key, 
  api_secret: process.env.CLOUDINARY_api_secret
});


 // CREATE NEW Photo ROUTE
router.get("/index/:id/new", middleware.isLoggedIn, function(req, res){
	var eventId = req.params.id;
	res.render("photos/new", {eventId: eventId});
});

// CREATE ROUTE / NEW Photo ROUTE ADD TO DB
router.post("/index/:id", middleware.isLoggedIn, middleware.upload, function(req,res){
	eventObject.findById(req.params.id, function(err, foundEvent){
		if(err){
			console.log(err);
		}else{
			cloudinary.uploader.upload(req.file.path, function(err, result) {
				if(err) {
					req.flash('From cloudinary error', err.message);
					console.log("there was an error!", err.message);
					return res.redirect('back');
			  }
				var name = req.body.name;
				var image = result.secure_url;
				var imageId = result.public_id;
				var price = req.body.price;
				var description = req.body.description;
				var event = foundEvent.name;
				var source = req.body.source;
				var newPhotoObject = {event: event, name: name, image: image, price: price, description: description, imageId: imageId, source: source};
				photoObject.create(newPhotoObject, function(err, newlyCreatedPhotoObject){
					if (err){
						console.log(err);
						req.flash('error', err.message);
						return res.redirect('back');
					}else{
						res.redirect("/index/"+req.params.id);
					}
				});
			});
		}
	});
});

// EDIT Photo Object FORM ROUTE
router.get("/index/:id/edit", middleware.isLoggedIn, function(req, res){
	photoObject.findById(req.params.id, function(err, foundPhoto){
		if (!foundPhoto) {
                return res.status(400).send("Item not found.")
            }
		res.render("photos/edit", {picture: foundPhoto});
	});
});

// UPDATE Photo Object ROUTE
router.put("/index/:id", middleware.isLoggedIn, middleware.upload, function(req, res){
	 photoObject.findById(req.params.id, async function(err, foundPhoto){
        if(err){
            req.flash("error", err.message);
			console.log("there was an error !");
			console.log(err);
            res.redirect("back");
        } else {
			  if (req.file) {
				  try {
					  await cloudinary.uploader.destroy(foundPhoto.imageId);
					  var result = await cloudinary.uploader.upload(req.file.path);
					  foundPhoto.imageId = result.public_id;
					  foundPhoto.image = result.secure_url;
				  } catch(err) {
					  req.flash("error", err.message);
					  console.log("there was an error !");
					  console.log(err);
					  return res.redirect("back");
				  }
			  }
            foundPhoto.name = req.body.name || foundPhoto.name;
            foundPhoto.description = req.body.description || foundPhoto.description;
			foundPhoto.price = req.body.price || foundPhoto.price;
            foundPhoto.save();
            req.flash("success","Successfully Updated!");
			console.log("Successfully updated !");
			eventObject.find({}, function(err, allEvents){
				if (err){
					console.log(err);
					req.flash("err", err.message);
				}else{
					allEvents.forEach(function(event){
						if(event.name == foundPhoto.event){
							var eventId = event._id;
							return res.redirect("/index/"+eventId);
						}
					});
				}
			});
        }
    });
});


// DESTROY PHOToOBJECT
router.delete('/index/:id/photo', middleware.isLoggedIn, function(req, res) {
  photoObject.findById(req.params.id, async function(err, campground) {
    if(err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
    try {
		console.log(campground);
        await cloudinary.uploader.destroy(campground.imageId, function(result) { console.log(result) });
        campground.remove();
        req.flash('success', 'photo deleted successfully!');
		console.log("photo deleted successfully!")
        res.redirect('/index');
    } catch(err) {
        if(err) {
          req.flash("error", err.message);
		  console.log("there was an error in photo destroy route");
          return res.redirect("back");
        }
    }
  });
});

// show photo for purchase
router.get("/prints/photo/:id", function(req, res){
	photoObject.findById(req.params.id, function(err, foundPhoto){
		if(err){
			console.log(err);
		}else{
			if (!foundPhoto) {
                return res.status(400).send("Item not found.")
            }else{
				console.log(foundPhoto);
				res.render("show", {picture: foundPhoto});
			}
		}
	});
});

module.exports = router;