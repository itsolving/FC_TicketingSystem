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
		if(sessData.cashier){
			sLogin = sessData.userLogin;
			nUserID = sessData.userID;
			events = sessData.eventsList;
		}
		else {
			res.redirect('/');
			return;
		}

		dbUtils.Event.getById(eventID, (data) => {
			if( data.length > 0){
				res.render('KassaBetaEventmap', {title: 'Продажа билетов', userLogin: sLogin, EventName: data[0].Name});
			}
			else res.json({err: 'Event not found'})
		}, false)
	})
	
}