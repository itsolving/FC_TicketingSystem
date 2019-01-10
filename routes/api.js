let express 		= require('express'),
	router  		= express.Router(),
	requireFu 		= require('require-fu'),
	multer			= require('multer'),
	upload 			= multer({ storage: multer.memoryStorage() }),
	dbUtils 		= require(`${__basedir}/database/DatabaseUtils.js`);		// Управление бд


let testAPIKEY = '12312dsgfdg123dfs';



requireFu(__dirname + '/sellerAPI')(router, dbUtils, testAPIKEY);					// подключение всего api роутинга для сторонних продавцов


module.exports = router;
