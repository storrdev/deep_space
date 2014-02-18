var fs = require('fs');
var gameMath = require('./Math.js');
var query = require('pg-query');
	query.connectionParameters = "postgres://deepspace:password@localhost/deepspace";

exports.getChunk = function(x, y, fn) {

	var chunk_query = "select json from chunks where x = " + x + " and y = " + y;

	query(chunk_query, function(err, rows, result) {
		if (rows.length == 0) {
			// This is where you generate a new chunk
			console.log('generating new chunk');
			var newChunk = generateChunk(x, y, fn);
		}
		else {
			fn(rows[0].json);
		}
	});

};

var generateChunk = function(x, y, cb) {
	var chunk = {};

    chunk.height = 10;
    chunk.width = 10;
    chunk.tileheight = 60;
    chunk.tilewidth = 60;
    chunk.orientation = "orthogonal";
    chunk.tilesets = [];
    chunk.properties = {};
    chunk.version = 1;
    chunk.layers = [];
    chunk.layers[0] = {};
    chunk.layers[0].name = "collision";
    chunk.layers[0].height = chunk.height;
    chunk.layers[0].width = chunk.width;
    chunk.layers[0].opacity = 1;
    chunk.layers[0].visible = true;
    chunk.layers[0].type = "objectgroup";
    chunk.layers[0].objects = [];

    var newObject;
    var chunk_json = "this";

    fs.readFile('./spawnable_objects.json', 'utf8', function (err, data) {
		if (err) throw err;
		var spawnable = JSON.parse(data);
		var numObjects = Math.ceil(Math.random()*3);
		console.log(numObjects);
		for (var o = 0; o < numObjects; o++) {
			newObject = {"id": o};
			objectRef = spawnable.objects[Math.ceil((Math.random() * spawnable.objects.length) - 1)];
			for (var prop in objectRef) {
				if(objectRef.hasOwnProperty(prop)){
			    	newObject[prop] = objectRef[prop];
			    }
			}
			newObject.scale = Math.random().toFixed(2);
			newObject.width = Math.ceil(newObject.width * newObject.scale);
			newObject.height = Math.ceil(newObject.height * newObject.scale);

			var touching = true;

			while (touching === true) {
				newObject.x = Math.ceil(Math.random() * (chunk.width * chunk.tilewidth));
				newObject.y = Math.ceil(Math.random() * (chunk.height * chunk.tileheight));
				//console.log(newObject.x + ', ' + newObject.y);
				if (chunk.layers[0].objects.length < 1) { touching = false; }
				for (var i = 0; i < chunk.layers[0].objects.length; i++) {
					if (gameMath.distance(newObject.x, chunk.layers[0].objects[i].x, newObject.y, chunk.layers[0].objects[i].y)
						> (newObject.width/2) + (chunk.layers[0].objects[i].width/2)) {
						touching = false;
					}
				}
			}

			chunk.layers[0].objects.push(newObject);
			newObject = null;
		}

		chunk_json = JSON.stringify(chunk, null, "\t");

		var new_chunk_query = "insert into chunks (x, y, json) values (" + x + ", " + y + ", '" + chunk_json + "')";

		query(new_chunk_query, function(err, rows, result) {
			console.log('err: ' + err);
			console.log('rows: ' + rows);
			console.log('result: ' + result);
		});

		cb(chunk_json);

	});
}