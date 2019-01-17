let express   = require('express'),
	router    = express.Router(),
	db 		  = require('./queries'),
	requireFu = require('require-fu');


requireFu(__dirname + '/main')(router, db);


module.exports = router;
