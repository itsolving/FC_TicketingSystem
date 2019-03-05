let express 		= require('express'),
	router  		= express.Router(),
	requireFu 		= require('require-fu'),
	multer			= require('multer'),
	upload 			= multer({ storage: multer.memoryStorage() }),
	dbUtils 		= require(`${__basedir}/database/DatabaseUtils.js`),		// Управление бд
	sAdminPageTitle = 'Управление билетной системой';



requireFu(__dirname + '/admin')(router, dbUtils, sAdminPageTitle);					// подключение всего админ роутинга из /admin/


setInterval(() => {
    dbUtils.Timer.analysis((data) => {
    	let ticketsID = [];
    	if ( data.length > 0 ){
    		data.forEach((item) => {
	    		ticketsID.push(item.IDTicket);
	    	})

	    	dbUtils.Timer.update(ticketsID, (ans) => {
	    		console.log(ans);
	    	})
    	}
    })
}, 60 * 1000);

module.exports = router;
