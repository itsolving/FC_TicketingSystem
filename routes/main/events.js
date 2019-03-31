let passwordHash = require('password-hash'),
	fs 			 = require('fs');


module.exports = (router, dbUtils) => {
	//открытие страницы со список актуальных мероприятий (для кассира и для онлайн посетителей)
	router.get('/events', function(req, res, next){
		console.log("get: /events");
		var sLogin = "";
		var events = {};
		var sessData = req.session;
		if(sessData.userLogin){
			sLogin = sessData.userLogin;
			console.log('sLogin='+sLogin);
		}
		
		dbUtils.Event.getAll((data) => {
			console.log('events found:');
				sessData.eventsList = data;
				events = data;
				console.log('rendering page...');
				res.render('events', {
										title: 'Покупка билетов', 
										userLogin: sLogin, 
										eventsList: events, 
										api: sessData.api || false, 
										cashier: sessData.cashier || false
									})
		})

	});

	//получение список актуальных мероприятий в формате json
	router.get('/getevents', function(req, res, next){
		console.log("get: /getevents");
		var events = {};
			dbUtils.Event.getAll((data) => {
				if ( data != {} ){
					console.log('events found:');
					events = data;
					res.status(200)
						.json({
							status: 'success',
							message: 'events found',
							events: events
						});
				}
				else {
					res.status(200)
						.json({
							status: 'error',
							message: 'events not found',
							events: {}
						});
				}
			})
	});


	//вход на страницу выбранного мероприятия
	router.get('/event/:id', function(req, res, next){
		console.log("get: /event/id");
		var sLogin = "";
		var events = {};
		var sessData = req.session;
		var eventID = req.params.id;
		if(sessData.userLogin){
			sLogin = sessData.userLogin;

		}

		if ( sessData.cashier ){
			res.redirect('/kassa/event/' + eventID);
			return;
		}
		dbUtils.Event.customSelect((data => {
			sessData.eventsList = data;
			events = data;
			res.render('eventmap', {title: 'Продажа билетов', userLogin: sLogin, eventsList: events, eventID: eventID});
		    return;
		}))
	})
	
	
}