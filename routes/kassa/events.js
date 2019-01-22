module.exports = (router, db, PageTitle) => {

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
			res.json({err: "no success"});
			return;
		}
		/*else res.redirect('/login');*/
		/*else {
			res.redirect('/');
			return;
		}*/
		//if (sessData.eventsList){
			var sSQL = 'SELECT "ID", "Name", "ImgPath", "DateFrom" FROM public."tEvent" where "IDStatus" = 1';
			//console.log(sSQL);
			db.db.any(sSQL)
				.then(function(data){
					//console.log('events found:');
					//console.log(data);
					sessData.eventsList = data;
					events = data;
					//console.log('events: '+ JSON.stringify(events));

					res.render('KassaBetaEventmap', {title: 'Учет билетов', userLogin: sLogin, eventsList: events, eventID: eventID});
					return;
				})
				.catch(function(err){
					//return next(err);
					console.log('error of search actual events:');
					console.log(err);
				});
		/*}
		else {
			events = sessData.eventsList;
		}*/
		//console.log('sLogin='+sLogin+', eventID='+eventID);
		//res.render('eventmap', {title: 'Учет билетов', userLogin: sLogin, eventsList: events, eventID: eventID});
		res.render('KassaBetaEventmap', {title: 'Учет билетов', userLogin: sLogin, eventsList: events, eventID: eventID});
	})
	
}