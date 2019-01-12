let express 		= require('express'),
	router  		= express.Router(),
	requireFu 		= require('require-fu'),
	multer			= require('multer'),
	upload 			= multer({ storage: multer.memoryStorage() }),
	dbUtils 		= require(`${__basedir}/database/DatabaseUtils.js`);		// Управление бд




requireFu(__dirname + '/sellerAPI')(router, dbUtils);					// подключение всего api роутинга для сторонних продавцов


module.exports = router;
