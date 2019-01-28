let express 		= require('express'),
	router  		= express.Router(),
	requireFu 		= require('require-fu'),
	multer			= require('multer'),
	upload 			= multer({ storage: multer.memoryStorage() }),
	db 		  		= require('./queries'),		// Управление бд
	sAdminPageTitle = 'Касса';



requireFu(__dirname + '/kassa')(router, db, sAdminPageTitle);					// подключение всего админ роутинга из /kassa/


module.exports = router;
