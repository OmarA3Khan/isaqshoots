var mongoose = require("mongoose");

var mediaSchema = new mongoose.Schema({
	name : String,
	image : String,
	imageId: String,
	price : String,
	source : String,
	description : String,
	event: Boolean,
	photo: Boolean,
	eventName: String,
});

module.exports = mongoose.model("media", mediaSchema);