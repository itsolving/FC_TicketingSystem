module.exports = (router, PageTitle, dbUtils) => {

	//вход на страницу выбранного мероприятия
	router.get('/event/:id', function(req, res, next){
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
			dbUtils.Event.logGetByID(nUserID, eventID, data.length, (logResult) => {
				//nothing do here
			})
			if( data.length > 0){
				res.render('KassaEventmap', {title: 'Продажа билетов', userLogin: sLogin, EventName: data[0].Name, user: {cashier: true} });
			}
			else res.json({err: 'Event not found'})
		}, false)
	})
	
}