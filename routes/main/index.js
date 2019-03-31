module.exports = (router, dbUtils) => {
	//страница авторизации кассира
	router.get('/', function(req, res, next){
		console.log("get: /");
		var sLogin = "";
		var nUserID = 0;
		var events = {};
		var sessData = req.session;
		if(sessData.userLogin){
			res.redirect('/events/');
		// 	sLogin = sessData.userLogin;
		// 	nUserID = sessData.userID;
		// 	events = sessData.eventsList;
		// 	res.render('index', {title: 'Учет билетов', userLogin: sLogin, userID: nUserID, eventsList: events, api: sessData.api });
	    }

		//var events = db.getList(req, res, next);
		else res.redirect('/cashier');
	})

}