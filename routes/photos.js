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


 // CREATE NEW Photo ROUTE
router.get("/index/:id/new", middleware.isLoggedIn, function(req, res){
	var eventId = req.params.id;
	res.render("photos/new", {eventId: eventId});
});

// CREATE ROUTE / NEW Photo ROUTE ADD TO DB
router.post("/index/:id", middleware.isLoggedIn, upload.array('image'), function(req,res){
	eventObject.findById(req.params.id,async function(err, foundEvent){
		var quality = parseInt(req.body.quality);
		console.log("quality", quality);
		if(err){
			req.flash('error', err.message);
			return res.redirect("back")
		}else{
			if(!req.body.source){
				
				/* we would receive a request of file paths as array */

				let multipleUpload = new Promise(async (resolve, reject) => {
				  let upload_len = req.files.length
					  ,upload_res = new Array();
					console.log("upload_len : ",upload_len);
					for(let i = 0; i < upload_len; i++)
					{
						console.log("req.files[i].path : ", req.files[i].path)
						let filePath = req.files[i].path;
						await cloudinary.uploader.upload(filePath, {quality: quality}, (error, result) => {
							 var image = result.secure_url;
							  var imageId = result.public_id;
							  var eventName = foundEvent.name;
							  var event = false;
							  var photo = true;
							  var newPhotoObject = {image: image, imageId: imageId, eventName: eventName, event: event, photo: photo};
							  eventObject.create(newPhotoObject, function(err, newlyCreatedPhotoObject){
								  if (err){
									  req.flash('error', err.message);
									  return res.redirect('back');
								  }
							  });
							console.log("upload_res : ",upload_res);
							console.log("upload_res 2 : ",upload_res.length);
							if(i === (upload_len) - 1)
							{
							  /* resolve promise after upload is complete */
							  resolve(upload_res)
							}else if(result)
							{
							  /*push public_ids in an array */  
							  upload_res.push(result.public_id);
							} else if(error) {
							  console.log(error)
							  reject(error)
							}

						})

					} 
				})
				.then((result) => result)
				.catch((error) => error)

				let upload = await multipleUpload;
				return res.redirect("/index/"+req.params.id);
			}
			else{
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
router.put("/index/:id", middleware.isLoggedIn, upload.array('image'), function(req, res){
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