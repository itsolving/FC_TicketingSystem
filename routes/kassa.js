let express 		= require('express'),
	router  		= express.Router(),
	requireFu 		= require('require-fu'),
	multer			= require('multer'),
	upload 			= multer({ storage: multer.memoryStorage() }),
	dbUtils 		= require(`${__basedir}/database/DatabaseUtils.js`),		// Управление бд
	sAdminPageTitle = 'Управление билетной системой';



requireFu(__dirname + '/kassa')(router, dbUtils, sAdminPageTitle);					// подключение всего админ роутинга из /kassa/


module.exports = router;
