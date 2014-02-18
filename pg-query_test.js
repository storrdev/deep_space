var query = require('pg-query');
query.connectionParameters = "postgres://deepspace:password@localhost/deepspace";

/*getChunk(1, 1, function(chunk) {
	//Here is where you send the chunk back to the client.
});*/

function getChunk(x, y, fn) {

	var chunk_query = "select json from chunks where x = " + x + " and y = " + y;

	query(chunk_query, function(err, rows, result) {
		fn(rows);
	});

}