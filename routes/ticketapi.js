let express 		= require('express'),
	router  		= express.Router(),
	requireFu 		= require('require-fu'),
	dbUtils         = require(`${__basedir}/database/DatabaseUtils.js`)



requireFu(__dirname + '/ticketAPI')(router, dbUtils);					// подключение всего админ роутинга из /kassa/


module.exports = router;
