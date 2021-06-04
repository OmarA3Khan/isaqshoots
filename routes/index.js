require('dotenv').config();

var express 	 = require("express");
var router  	 = express.Router();
var eventObject  = require("../models/events.js");
var faqObject    = require("../models/faq.js");
var passport 	 = require("passport");
var middleware   = require("../middleware/index.js");
var User 		 = require("../models/user");
const stripe 	 = require('stripe')(process.env.Stripe_Sec_key);

// LANDING ROUTE
router.get("/",function(req,res){
	res.render("landing");
});

router.get("/films",function(req,res){
	eventObject.find({}, function(err, allMedia){
		if(err){
			req.flash("err", err.message);
			res.render("/");
		}else{
			res.render("films", {media: allMedia});
		}
	});
});


router.get("/prints", function(req, res){
	eventObject.find({}, function(err, allMedia){
		if(err){
			req.flash("err", err.message);
			return res.redirect("back");
		}else{
			res.render("prints", {media: allMedia});
		}
	});
});

// CART ROUTE
router.get("/cart", function(req, res){
	eventObject.find({}, function(err, allMedia){
		if(err){
			req.flash("err", err.message);
			res.redirect("/");
		}else{
			res.render("cart", {media: allMedia});
		}
	});
});


// CONTACT ROUTE
router.get("/contact", function(req,res){
	faqObject.find({}, function(err,faqs){
		if(err){
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
			req.flash("err", err.message);
			return res.redirect("/contact");
		}else{
			foundFaq.question = req.body.question || foundFaq.question;
			foundFaq.answer = req.body.answer || foundFaq.answer;
            foundFaq.save();
            req.flash("success","Successfully Updated!");
            res.redirect("/contact");
		}
	});
});

router.delete("/contact/:id", middleware.isLoggedIn, function(req, res){
	faqObject.findByIdAndRemove(req.params.id, function(err){
		if(err){
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

// ====================================== //

router.get("/success",async function(req, res){
	const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
  	const customer = await stripe.customers.retrieve(session.customer);
	res.render("success", {customer: customer});
});

router.get("/cancel", function(req, res){
	res.render("cancel");
});

// ========================================= //

router.post('/create-checkout-session', async (req, res) => {
  const cartContents = req.body.items;
	const lineItems = [];
    try {
        for (let item of cartContents) {
            const product = await eventObject.findById(item.productId);
            const productName = product.name;
            const productPrice = product.price;
            const productQuantity = item.qty;
			const productType = item.type;
			const productSize = item.size;
			if(productType == 'frame'){
			  var productFrameColor = item.Color;
			  lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name:'name: '+productName+' size: '+productSize+' type: '+productType+' color: '+productFrameColor,
                    },
                    unit_amount: productPrice * 100,
                },
                quantity: productQuantity,
            });
		  }else{
			  lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name:'name: '+productName+' size: '+productSize+' type: '+productType
                    },
                    unit_amount: productPrice * 100,
                },
                quantity: productQuantity,
            });
		  } 
        }
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
			shipping_address_collection: {
			  allowed_countries: ['US', 'CA'],
			},
            line_items: lineItems,
            mode: 'payment',
            success_url: 'https://www.isaqshoots.com/success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: 'https://www.isaqshoots.com/cancel',
        });
        res.json({id: session.id});
    } catch(e) {
		console.log(e);
		
        // handle error here
    }
});

router.get("/media/:id", function(req, res){
	eventObject.findById(req.params.id, function(err, media){
		if(err){
			return res.send("there was an error");
		}else {
			return res.send(media);
		}
	});
});

module.exports = router;