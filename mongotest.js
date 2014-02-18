// Retrieve
var MongoClient = require('mongodb').MongoClient;

// Connect to the db
MongoClient.connect("mongodb://localhost:27017/deep_space", function(err, db) {
	if(err) { return console.dir(err); }

	var collection = db.collection('chunks');

	var chunkBuffer = 5;

	var player = {
		x: 6,
		y: 9
	}

	console.log(player.x + ', ' + player.y);

  	var stream = collection.find({
  		x: {$gt: player.x - chunkBuffer, $lt: player.x + chunkBuffer},
  		y: {$gt: player.y - chunkBuffer, $lt: player.y + chunkBuffer}
  	}).stream();
	stream.on("data", function(item) {
		console.log(item);
	});
	stream.on("end", function() {});
});