let express   = require('express'),
	router    = express.Router(),
	requireFu = require('require-fu'),
	dbUtils   = require(`${__basedir}/database/DatabaseUtils.js`);


requireFu(__dirname + '/main')(router, dbUtils);


module.exports = router;
