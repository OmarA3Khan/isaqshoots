var express 	= require("express");
var router  	= express.Router();
var eventObject = require("../models/events.js");
var middleware  = require("../middleware/index.js");


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
	eventObject.findById(req.params.id,async function(err, foundEvent){
		var quality = parseInt(req.body.quality);
		console.log("quality", quality);
		if(err){
			req.flash('error', err.message);
			return res.redirect("back")
		}else{
			if(req.file){
				var result = await cloudinary.uploader.upload(req.file.path, {quality: quality}, function(err, result) {
					if(err){
						console.log(err);
						req.flash('From cloudinary error', err.message);
						return res.redirect('back');
					}else{
						console.log(result);
					}
				});
				var name = req.body.name;
				var image = result.secure_url;
				var imageId = result.public_id;
				var price = req.body.price;
				var description = req.body.description;
				var eventName = foundEvent.name;
				var event = false;
				var photo = true;
				var source = req.body.source;
				var newPhotoObject = {name: name, image: image, imageId: imageId, price: price, description: description, eventName: eventName, event: event, photo: photo, source: source};
				eventObject.create(newPhotoObject, function(err, newlyCreatedPhotoObject){
					if (err){
						req.flash('error', err.message);
						return res.redirect('back');
					}else{
						return res.redirect("/index/"+req.params.id);
					}
				});
			}else{
				var name = req.body.name;
				var price = req.body.price;
				var description = req.body.description;
				var eventName = foundEvent.name;
				var event = false;
				var photo = true;
				var source = req.body.source;
				var newPhotoObject = {name: name, price: price, description: description, eventName: eventName, event: event, photo: photo, source: source};
				eventObject.create(newPhotoObject, function(err, newlyCreatedPhotoObject){
					if (err){
						req.flash('error', err.message);
						return res.redirect('back');
					}else{
						return res.redirect("/index/"+req.params.id);
					}
				});
			}
		}
	});
});

// EDIT Photo Object FORM ROUTE
router.get("/index/:id/edit", middleware.isLoggedIn, function(req, res){
	eventObject.findById(req.params.id, function(err, foundPhoto){
		if (!foundPhoto) {
                return res.status(400).send("Item not found.")
            }
		res.render("photos/edit", {picture: foundPhoto});
	});
});

// UPDATE Photo Object ROUTE
router.put("/index/:id", middleware.isLoggedIn, middleware.upload, function(req, res){
	 eventObject.findById(req.params.id, async function(err, foundPhoto){
		var quality = parseInt(req.body.quality);
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
			  if (req.file) {
				  try {
					  await cloudinary.uploader.destroy(foundPhoto.imageId, function(err, result){
						  if(err){
							  console.log(err);
							  req.flash("error", err.message);
            				  res.redirect("back");
						  }else{
							  console.log("destroyed ?: ",result);
						  }
					  });
					  var result = await cloudinary.uploader.upload(req.file.path, {quality: quality}, function(err, result){
						  if(err){
							  console.log(err);
							  req.flash("error", err.message);
            				  res.redirect("back");
						  }else{
							  console.log(result);
						  }
					  });
					  foundPhoto.imageId = result.public_id;
					  foundPhoto.image = result.secure_url;
				  } catch(err) {
					  req.flash("error", err.message);
					  return res.redirect("back");
				  }
			  }
            foundPhoto.name = req.body.name || foundPhoto.name;
            foundPhoto.description = req.body.description || foundPhoto.description;
			foundPhoto.price = req.body.price || foundPhoto.price;
			foundPhoto.event = false;
			foundPhoto.photo = true;
			foundPhoto.eventName = foundPhoto.eventName;
            foundPhoto.save();
            req.flash("success","Successfully Updated!");
			eventObject.find({}, function(err, allEvents){
				if (err){
					req.flash("err", err.message);
				}else{
					allEvents.forEach(function(event){
						if(event.name == foundPhoto.eventName){
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
  eventObject.findById(req.params.id, async function(err, photo) {
    if(err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
    try {
		if(photo.imageId){
			await cloudinary.uploader.destroy(photo.imageId, function(err, result){
				  if(err){
					  console.log(err);
					  req.flash("error", err.message);
					  res.redirect("back");
				  }else{
					  console.log("destroyed ? : ",result);
				  }
			  });
		}
        photo.remove();
        req.flash('success', 'photo deleted successfully!');
        res.redirect('/index');
    } catch(err) {
        if(err) {
          req.flash("error", err.message);
          return res.redirect("back");
        }
    }
  });
});

// show photo for purchase
router.get("/prints/photo/:id", function(req, res){
	eventObject.findById(req.params.id, function(err, foundPhoto){
		if(err){
		}else{
			if (!foundPhoto) {
                return res.status(400).send("Item not found.")
            }else{
				res.render("show", {picture: foundPhoto});
			}
		}
	});
});

module.exports = router;