var mongoose = require("mongoose");

var eventSchema = new mongoose.Schema({
	eventName : String,
	name : String,
	image : String,
	imageId: String,
	price : String,
	source : String,
	description : String,
});

module.exports = mongoose.model("event", eventSchema);