let express 		= require('express'),
	router  		= express.Router(),
	requireFu 		= require('require-fu'),
	multer			= require('multer'),
	upload 			= multer({ storage: multer.memoryStorage() }),
	db 		  		= require('./queries'),		// Управление бд
	sAdminPageTitle = 'Касса',
	dbUtils         = require(`${__basedir}/database/DatabaseUtils.js`)



requireFu(__dirname + '/kassa')(router, db, sAdminPageTitle, dbUtils);					// подключение всего админ роутинга из /kassa/


module.exports = router;
