let express 		= require('express'),
	router  		= express.Router(),
	requireFu 		= require('require-fu'),
	multer			= require('multer'),
	upload 			= multer({ storage: multer.memoryStorage() }),
	dbUtils 		= require(`${__basedir}/database/DatabaseUtils.js`),		// Управление бд
	sAdminPageTitle = 'Управление билетной системой';



requireFu(__dirname + '/admin')(router, dbUtils, sAdminPageTitle);					// подключение всего админ роутинга из /admin/


module.exports = router;
