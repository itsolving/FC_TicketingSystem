module.exports = (router, dbUtils) => {
	//страница авторизации кассира
	router.get('/', function(req, res, next){
		console.log("get: /");
		var sLogin = "";
		var nUserID = 0;
		var events = {};
		var sessData = req.session;
		if ( sessData.cashier || sessData.api ){
			res.redirect('/events');
		}
		else if ( sessData.admControl ){
			res.redirect('/admin/events/')
		}
		else {
			res.redirect('/login/');
		}
	})

}