var sslRedirect	   = require('heroku-ssl-redirect').default;
var	express        = require("express");
var	app 	       = express();

// enable ssl redirect
app.use(sslRedirect());

var	bodyParser     = require("body-parser"),
	mongoose       = require("mongoose"),
	flash          = require("connect-flash"),
	passport       = require("passport"),
	LocalStrategy  = require("passport-local"),
	methodOverride = require("method-override"),
	middleware 	   = require("./middleware/index.js"),
	faqObject      = require("./models/faq.js"),
	User           = require("./models/user.js"),
	eventObject    = require("./models/events.js");

// Requiring Routes here
var eventRoutes  = require("./routes/events");
var photoRoutes  = require("./routes/photos");
var	indexRoutes  = require("./routes/index");

require('dotenv').config();
//  
var url ="mongodb://localhost:27017/V8photos";

try {
    var db = mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true});
    console.log('success connection at :'+ url);
}
catch (error) {
    console.log('Error connection: ' + error);
}

// ==============  STRIPE CONFIG  ==========
const stripe = require('stripe')(process.env.Stripe_Sec_key_test);

// ===========================

// ========= APP CONFIG ==========//
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.static("public"));
// app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(flash());

// ========  MULTER & CLOUDINARY CONFIG ==================== //

// var multer = require('multer');
// var storage = multer.diskStorage({
//   filename: function(req, file, callback) {
//     callback(null, Date.now() + file.originalname);
//   }
// });

// var upload = multer({storage: storage}).single('image');

var cloudinary = require("cloudinary").v2;
cloudinary.config({ 
  cloud_name: 'isaqshoots', 
  api_key: process.env.CLOUDINARY_api_key, 
  api_secret: process.env.CLOUDINARY_api_secret
});

// =========================   ===========================//

// === PASSPORT CONFIG ===== //
app.use(require("express-session")({
	secret: process.env.PASSPORT_secret,
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ========================================  //


app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});


app.use(eventRoutes);
app.use(photoRoutes);
app.use(indexRoutes);

// ================================ APP ROUTES =========================================== //
// ======================================================================================= //


app.listen(process.env.PORT, process.env.IP, function(){
	console.log("Server is running");
});