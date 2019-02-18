let passwordHash = require('password-hash'),
	fs 			 = require('fs');


module.exports = (router, db, dbUtils) => {
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
				res.render('events', {title: 'Покупка билетов', userLogin: sLogin, eventsList: events, api: sessData.api || false});
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
			res.redirect('/kassa/beta/event/' + eventID);
			return;
		}
		dbUtils.Event.customSelect((data => {
			sessData.eventsList = data;
			events = data;
			res.render('eventmap', {title: 'Продажа билетов', userLogin: sLogin, eventsList: events, eventID: eventID});
		    return;
		}))
	})



	//эта функция не используется, создавал для работы со схемой зала
	/*router.get('/maps/:idevent', function(req, res, next){
		console.log("get: /maps/idevent");
		var sLogin = "";
		var eventID = req.params.idevent;
		var sessData = req.session;
		if(sessData.userLogin){
			sLogin = sessData.userLogin;
		}
		var sSQL = 'SELECT "ID", "Name", "MapPath" FROM public."tStadium" where "IDStatus" = 1 and "ID" in (select ev."IDStadium" from public."tEvent" ev where ev."ID" = '+eventID+') limit 1';
		console.log(sSQL);
		db.db.any(sSQL)
			.then(function(data){
				console.log('stadium found:');
				console.log(data);
				console.log('map: '+ JSON.stringify(data));
				if(data !== 'undefined'){
					console.log('data not undefined');
					if(data.rowcount !== 'undefined'){
						if(data.rowcount > 0){
							if(data[0].MapPath !== 'undefined'){
								console.log('data[0].MapPath not undefined');
								responseFile = (fileName, response) => {
									const filePath =  data[0].MapPath; //"/path/to/archive.rar" // or any file format
									console.log('filePath='+filePath);
									// Check if file specified by the filePath exists
									fs.exists(__dirname + '/../public'+filePath, function(exists){
										if (exists) {
											console.log('filePath exists');
											// Content-type is very interesting part that guarantee that
											// Web browser will handle response in an appropriate manner.
											res.writeHead(200, {
												"Content-Type": "application/octet-stream",
												"Content-Disposition": "attachment; filename=" //+ fileName
											});
											fs.createReadStream(__dirname + '/../public'+filePath).pipe(res);
										} else {
											console.log('filePath not exists');
											res.writeHead(400, {"Content-Type": "text/plain"});
											res.end("ERROR File does not exist");
										}
									});
									res.render(filePath.replace('.svg',''));
								}

							}
						}
					}
				}
				//res.send(data);
				//return;
			})
			.catch(function(err){
				//return next(err);
				console.log('error of search map:');
				console.log(err);
			});
	});*/
	
	
}