var express = require("express");
var router  = express.Router();
var eventObject    = require("../models/events.js");
var	photoObject    = require("../models/photos.js")
var middleware = require("../middleware/index.js");


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

// ========  ================ ==================== //

// INDEX ROUTE
router.get("/index",function(req,res){
	// photoObject.find({}, function(err, allPhotos){
	eventObject.find({}, function(err, allEvents){

		if(err){
			console.log(err);
			req.flash("err", err.message);
			res.render("/");
		}else{
			res.render("Events/index", {events: allEvents});
		}
	});
});

// CREATE NEW Event ROUTE
router.get("/newevent", middleware.isLoggedIn, function(req, res){
	res.render("Events/newEvent");
});

// CREATE ROUTE / NEW Event ROUTE ADD TO DB
router.post("/newevent", middleware.isLoggedIn, middleware.upload, function(req,res){
	cloudinary.uploader.upload(req.file.path, function(err, result) {
		if(err) {
			req.flash('From cloudinary error', err.message);
			console.log("there was an error!", err.message);
			return res.redirect('back');
      	}
		var event = req.body.eventName;
		var name = req.body.name;
		var image = result.secure_url;
		var imageId = result.public_id;
		var price = req.body.price;
		var description = req.body.description;
		var source = req.body.source;
		var newEventObject = {eventName: event, name: name, image: image, price: price, description: description, imageId: imageId, source: source};
		eventObject.create(newEventObject, function(err, newlyCreatedEventObject){
			if (err){
				console.log(err);
				req.flash('error', err.message);
          		return res.redirect('back');
			}else{
				res.redirect("/index");
			}
		});
	});
});

// show Event
router.get("/index/:id", function(req, res){
	eventObject.findById(req.params.id, function(err, event){
		// var eventName = event.name;
		if(err){
			console.log(err);
		}else{
			photoObject.find({}, function(err, foundPhotos){
				if(err){
					console.log(err);
				}else{
					if (!foundPhotos) {
						return res.status(400).send("Item not found.")
					}else{
						// console.log(foundPhotos);
						res.render("Events/showevent", {event: event, allPhotos: foundPhotos});
					}
				}
			});
		}	
	});
});

// EDIT Event FORM ROUTE
router.get("/index/:id/editevent", middleware.isLoggedIn, function(req, res){
	eventObject.findById(req.params.id, function(err, foundEvent){
		if (!foundEvent) {
                return res.status(400).send("Item not found.")
            }
		res.render("Events/editEvent", {event: foundEvent});
	});
});

// UPDATE Event ROUTE
router.put("/index/event/:id", middleware.isLoggedIn, middleware.upload, function(req, res){
	 eventObject.findById(req.params.id, async function(err, foundEvent){
        if(err){
            req.flash("error", err.message);
			console.log("there was an error !");
			console.log(err);
            res.redirect("back");
        } else {
			  if (req.file) {
				  try {
					  await cloudinary.uploader.destroy(foundEvent.imageId);
					  var result = await cloudinary.uploader.upload(req.file.path);
					  foundEvent.imageId = result.public_id;
					  foundEvent.image = result.secure_url;
				  } catch(err) {
					  req.flash("error", err.message);
					  console.log("there was an error !");
					  console.log(err);
					  return res.redirect("back");
				  }
			  }
			foundEvent.name = req.body.name || foundEvent.name;
			if(req.body.name){
				console.log("name changed")
				photoObject.find({}, function(err, allPhotos){
					if(err){
						console.log(err);
						req.flash("error", err.message);
						res.redirect("back");
					}
					allPhotos.forEach(function(photo){
						if(photo.event == foundEvent.name){
							console.log("found a match");
							photo.event == req.body.name;
						}
					});
				});
			}
			foundEvent.eventName = req.body.eventName || foundEvent.eventName;
            foundEvent.description = req.body.description || foundEvent.description;
			foundEvent.price = req.body.price || foundEvent.price;
            foundEvent.save();
            req.flash("success","Successfully Updated!");
			console.log("Successfully updated !");
            res.redirect("/index/" + foundEvent._id);
        }
    });
});

// DESTROY Event OBJECT
router.delete('/index/:id', middleware.isLoggedIn, function(req, res) {
  eventObject.findById(req.params.id, async function(err, foundEvent) {
    if(err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
    try {
        await cloudinary.uploader.destroy(foundEvent.imageId, function(result) { console.log(result) });
        foundEvent.remove();
        req.flash('success', 'Event deleted successfully!');
		console.log("Event deleted successfully!")
        res.redirect('/index');
    } catch(err) {
        if(err) {
          req.flash("error", err.message);
		  console.log("there was an error");
          return res.redirect("back");
        }
    }
  });
});

// show Event for purchase
router.get("/prints/event/:id", function(req, res){
	eventObject.findById(req.params.id, function(err, foundEvent){
		if(err){
			console.log(err);
		}else{
			if (!foundEvent) {
                return res.status(400).send("Item not found.")
            }else{
				console.log(foundEvent);
				res.render("show", {picture: foundEvent});
			}
		}
	});
});

module.exports = router;