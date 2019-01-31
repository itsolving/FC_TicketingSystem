let express   = require('express'),
	router    = express.Router(),
	db 		  = require('./queries'),
	requireFu = require('require-fu'),
	dbUtils   = require(`${__basedir}/database/DatabaseUtils.js`);


requireFu(__dirname + '/main')(router, db, dbUtils);


module.exports = router;
