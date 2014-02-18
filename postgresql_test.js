var pg = require('pg');
var conString = "postgres://deepspace:password@localhost/deepspace";

pg.connect(conString, function(err, client, done) {
	if(err) {
		return console.error('error fetching client from pool', err);
	}

 	function getChunk(x, y) {

		client.query('select json from chunks where x = ' + x + ' and y = ' + y, function(err, result) {
			//call `done()` to release the client back to the pool
			done();

			if(err) {
			  return console.error('error running query', err);
			}

			if (result.rows.length === 0) {

				var newChunk = "this is a new chunk";

				var insert_statement = "insert into chunks (x, y, json) values (" + x + ", " + y + ", '" + newChunk + "')";
				client.query(insert_statement);
				return newChunk;
			}
			else {
				for (var r = 0; r < result.rows.length; r++) {
					var json = result.rows[r].json;
					console.log(json);
					return result.rows[r].json;
				}
			}
		});
	}

	var thing = getChunk(1, 1);
  	console.log(thing);
 	console.log(getChunk(2, 2));
 	//console.log(getChunk(10, 10));
});