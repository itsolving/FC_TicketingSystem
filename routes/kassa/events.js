module.exports = (router, db, PageTitle, dbUtils) => {

	//вход на страницу выбранного мероприятия
	router.get('/beta/event/:id', function(req, res, next){
		console.log("get: /event/id");
		var eventID = req.params.id;
	
		//данные из сессии
		var sLogin = "";
		var nUserID = 0;
		var events = {};
		var sessData = req.session;
		if(sessData.userLogin){
			sLogin = sessData.userLogin;
			nUserID = sessData.userID;
			events = sessData.eventsList;
		}
		else {
			res.redirect('/');
			//res.json({err: "no success"});
			return;
		}
		dbUtils.Event.customSelect((data => {
			sessData.eventsList = data;
			events = data;
			res.render('KassaBetaEventmap', {title: 'Продажа билетов', userLogin: sLogin, eventsList: events, eventID: eventID});
		    return;
		}))
	})
	
}