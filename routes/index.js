var express 	 = require("express");
var router  	 = express.Router();
var eventObject  = require("../models/events.js");
var	photoObject  = require("../models/photos.js");
var faqObject      = require("../models/faq.js");
var passport = require("passport");
var middleware   = require("../middleware/index.js");
var User = require("../models/user");

// LANDING ROUTE
router.get("/",function(req,res){
	res.render("landing");
});

router.get("/films",function(req,res){
	photoObject.find({}, function(err, allPhotos){
		if(err){
			console.log(err);
			req.flash("err", err.message);
			res.render("/");
		}else{
			res.render("films", {photos: allPhotos});
		}
	});
});


router.get("/prints", function(req, res){
	eventObject.find({}, function(err, allEvents){
		if(err){
			console.log(err);
			req.flash("err", err.message);
			console.log("there was an error");
			return res.redirect("back");
		}else{
			photoObject.find({}, function(err, allPhotos){
				if(err){
					console.log(err);
					req.flash("err", err.message);
					console.log("there was an error");
					return res.redirect("back");
				}else{
					res.render("prints", {events: allEvents, allPhotos: allPhotos});
				}
			});
		}
	});
});

// CART ROUTE
router.get("/cart", function(req, res){
	eventObject.find({}, function(err, allEvents){

		if(err){
			console.log(err);
			req.flash("err", err.message);
			res.render("/");
		}else{
			res.render("cart", {events: allEvents});
		}
	});
});


// CONTACT ROUTE
router.get("/contact", function(req,res){
	faqObject.find({}, function(err,faqs){
		if(err){
			console.log(err);
			req.flash("err", err.message);
			res.redirect("contact");
		}else{
			res.render("contact", {faqs : faqs});
		}
		
	})
});

router.post("/contact", middleware.isLoggedIn, function(req,res){
	var question = req.body.question;
	var answer = req.body.answer;
	var newFaq = {question : question, answer : answer};
	faqObject.create(newFaq, function(err, newlyCreatedFaqObject){
		if(err){
			console.log(err);
			req.flash("err", err.message);
			return res.redirect("/contact");
		}else{
			res.redirect("/contact");
		}
	});
});

router.put("/contact/:id", middleware.isLoggedIn, function(req,res){
	faqObject.findById(req.params.id, function(err, foundFaq){
		if(err){
			console.log(err);
			req.flash("err", err.message);
			return res.redirect("/contact");
		}else{
			foundFaq.question = req.body.question || foundFaq.question;
			foundFaq.answer = req.body.answer || foundFaq.answer;
            foundFaq.save();
            req.flash("success","Successfully Updated!");
			console.log("Successfully updated !");
            res.redirect("/contact");
		}
	});
});

router.delete("/contact/:id", middleware.isLoggedIn, function(req, res){
	faqObject.findByIdAndRemove(req.params.id, function(err){
		if(err){
			console.log(err);
			req.flash("error", err.message);
			res.redirect("back");
		}else{
			req.flash("success", "Faq Deleted");
			res.redirect("/contact");
		}
	});
});


//ABOUT ROUTE
router.get("/about", function(req,res){
	res.render("about");
});

// ========================== Register Route  ======================= // 

router.get("/register", function(req, res){
	res.render("register");
});

router.post("/register", function(req, res){
	var newUser = new User({username: req.body.username});
	User.register(newUser, req.body.password, function(err, newlyCreatedUser){
		if(err){
			console.log(err);
			req.flash("error", err.message);
			return res.redirect("/register");
		}
		passport.authenticate("local")(req, res, function(){
			req.flash("success", "Welcome to IsaqShoots "+ newlyCreatedUser.username);
			res.redirect("/index");
		});
	});
});

//       ========================================================== //


// ========== Login & Logout Routes ======== //
router.get("/login", function(req, res){
	res.render("login");
});

router.post("/login", passport.authenticate("local",
	{
		failureFlash: true,
		failureRedirect: "/login"
}) , function(req, res){
	req.flash("success", "welcome back");
	const redirectUrl = req.session.returnTo || "/index";
	delete req.session.returnTo;
	res.redirect(redirectUrl);
});

router.get("/logout", function(req, res){
	req.logout();
	req.flash("success", "Logged you out Successfully");
	res.redirect("/index");
});

// ========================================= //

module.exports = router;