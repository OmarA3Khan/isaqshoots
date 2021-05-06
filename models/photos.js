var mongoose = require("mongoose");

var photoSchema = new mongoose.Schema({
	name : String,
	image : String,
	imageId: String,
	price : String,
	description : String,
	source : String,
	event: String
});

module.exports = mongoose.model("photoObject", photoSchema);