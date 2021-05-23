var User = require("../models/user")

// Multer config //
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});

// all the middleware goes here
var middlewareObj = {};

middlewareObj.isLoggedIn = function(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	req.session.returnTo = req.originalUrl;
	req.flash("error", "YOU NEED TO BE LOGGED IN TO DO THAT");
	res.redirect("/login");
}

middlewareObj.upload = multer({storage: storage}).single('image')

module.exports = middlewareObj