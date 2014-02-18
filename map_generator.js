(function () {
    var fs = require('fs');
    var gameMath = require('./Math.js');

    var map = {};

    map.height = 10;
    map.width = 10;
    map.tileheight = 60;
    map.tilewidth = 60;
    map.orientation = "orthogonal";
    map.tilesets = [];
    map.properties = {};
    map.version = 1;
    map.layers = [];
    map.layers[0] = {};
    map.layers[0].name = "collision";
    map.layers[0].height = map.height;
    map.layers[0].width = map.width;
    map.layers[0].opacity = 1;
    map.layers[0].visible = true;
    map.layers[0].type = "objectgroup";
    map.layers[0].objects = [];

    var newObject;

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
				newObject.x = Math.ceil(Math.random() * (map.width * map.tilewidth));
				newObject.y = Math.ceil(Math.random() * (map.height * map.tileheight));
				//console.log(newObject.x + ', ' + newObject.y);
				if (map.layers[0].objects.length < 1) { touching = false; }
				for (var i = 0; i < map.layers[0].objects.length; i++) {
					if (gameMath.distance(newObject.x, map.layers[0].objects[i].x, newObject.y, map.layers[0].objects[i].y)
						> (newObject.width/2) + (map.layers[0].objects[i].width/2)) {
						touching = false;
					}
				}
			}

			map.layers[0].objects.push(newObject);
			newObject = null;
		}

		fs.writeFile("./map.json", JSON.stringify(map, null, "\t"), function(err) {
		    if(err) {
		        console.log(err);
		    } else {
		        console.log("The file was saved!");
		    }
		}); 

	});
})();