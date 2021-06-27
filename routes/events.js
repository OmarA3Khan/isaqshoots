var express 	= require("express");
var router  	= express.Router();
var eventObject = require("../models/events.js");
var middleware  = require("../middleware/index.js");
const upload 	= require('../middleware/multer.js');


// ========  MULTER & CLOUDINARY CONFIG ==================== //
// var multer = require('multer');
// var storage = multer.diskStorage({
//   filename: function(req, file, callback) {
//     callback(null, Date.now() + file.originalname);
//   }
// });

var cloudinary = require("cloudinary").v2;
cloudinary.config({ 
  cloud_name: 'isaqshoots', 
  api_key: process.env.CLOUDINARY_api_key, 
  api_secret: process.env.CLOUDINARY_api_secret
});

// ========  ================ ==================== //

// INDEX ROUTE
router.get("/index",function(req,res){
	eventObject.find({event: true}, function(err, allEvents){
		if(err){
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

// CREATE ROUTE / NEW Event ROUTE, ADD TO DB
router.post("/newevent", middleware.isLoggedIn, upload.single('image'), function(req,res){
	var quality = parseInt(req.body.quality);
	cloudinary.uploader.upload(req.file.path, {quality: quality}, function(err, result) {
		if(err) {
			console.log(err);
			req.flash(' Error From cloudinary', err.message);
			return res.redirect('back');
	}else{
			// console.log(result);
		}
		var event = true;
		var photo = false;
		var name = req.body.name;
		var image = result.secure_url;
		var imageId = result.public_id;
		var price = req.body.price;
		var description = req.body.description;
		var source = req.body.source;
		var newMediaObject = {event: event, photo: photo, name: name, image: image, price: price, description: description, imageId: imageId, source: source};
		eventObject.create(newMediaObject, function(err, newlyCreatedMediaObject){
			if (err){
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
	eventObject.find({}, function(err, allmedia){
		if(err){
			return res.status(400).send("Items not found ");
		}else {
			eventObject.findById(req.params.id, function(err, event){
				if(err){
					return res.status(400).send("Items not found ");
				}else {
					res.render("Events/showevent", {media: allmedia, event: event});
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
router.put("/index/event/:id", middleware.isLoggedIn, upload.single('image'), function(req, res){
	 eventObject.findById(req.params.id, async function(err, foundEvent){
		var quality = parseInt(req.body.quality);
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
			  const foundEventName = foundEvent.name;
			  if (req.file) {
				  try {
					  await cloudinary.uploader.destroy(foundEvent.imageId, function(err, result){
						  if(err){
							  console.log(err);
							  req.flash("error", err.message);
            				  res.redirect("back");
						  }else{
							  console.log("destroyed ? : ",result);
						  }
					  });
					  var result = await cloudinary.uploader.upload(req.file.path, {quality: quality}, function(err,result){
						  if(err){
							  console.log(err);
							  req.flash("error", err.message);
            				  res.redirect("back");
						  }else{
							  console.log(result);
						  }
					  });
					  foundEvent.imageId = result.public_id;
					  foundEvent.image = result.secure_url;
				  } catch(err) {
					  req.flash("error", err.message);
					  return res.redirect("back");
				  }
			  }
			foundEvent.name = req.body.name || foundEvent.name;
			if(req.body.name){
				eventObject.find({photo: true}, function(err, allPhotos){
					if(err){
						req.flash("error", err.message);
						res.redirect("back");
					}
					allPhotos.forEach(function(photo){
						if(photo.eventName == foundEventName){
							photo.eventName = req.body.name;
							photo.save();
						}
					});
				});
			}
            foundEvent.description = req.body.description || foundEvent.description;
			foundEvent.price = req.body.price || foundEvent.price;
			foundEvent.event = true || foundEvent.photo;
			foundEvent.photo = false || foundEvent.photo;
            foundEvent.save();
            req.flash("success","Successfully Updated!");
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
		var eventName = foundEvent.name;
		eventObject.find({photo: true, eventName: eventName},async function(err, result){
			if(err){
				console.log("error",err);
			}else{
				console.log("result", result);
				for(var i = 0; i < result.length; i++){
					if(result[i].imageId){
						await cloudinary.uploader.destroy(result[i].imageId, function(err, result){
							if(err){
								console.log('ERROR', err);
								req.flash("error", err.message);
								res.redirect("back");
							}else{
								console.log("destroyed ? : ",result);
							}
						});
					}
					result[i].remove();
					console.log("removed photo");
				}
			}
		})
		if(foundEvent.imageId){
		await cloudinary.uploader.destroy(foundEvent.imageId, function(err, result){
				if(err){
					console.log(err);
					req.flash("error", err.message);
					res.redirect("back");
				}else{
					console.log("destroyed ? : ",result);
				}
			});
		}
		foundEvent.remove();
		req.flash('success', 'Event deleted successfully!');
		res.redirect('/index');
    } catch(err) {
        if(err) {
		  console.log("error in catch", err);
          req.flash("error", err.message);
          return res.redirect("back");
        }
    }
  });
});

// show Event for purchase
router.get("/prints/event/:id", function(req, res){
	eventObject.findById(req.params.id, function(err, foundEvent){
		if(err){
		}else{
			if (!foundEvent) {
                return res.status(400).send("Item not found.")
            }else{
				res.render("show", {picture: foundEvent});
			}
		}
	});
});

module.exports = router;