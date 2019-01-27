let passwordHash = require('password-hash'),
	fs 			 = require('fs');


module.exports = (router, db) => {
	//открытие страницы со список актуальных мероприятий (для кассира и для онлайн посетителей)
	router.get('/events', function(req, res, next){
		console.log("get: /events");
		var sLogin = "";
		var events = {};
		var sSQL = "";
		var sessData = req.session;
		if(sessData.userLogin){
			sLogin = sessData.userLogin;

			console.log('sLogin='+sLogin);
		}
		//sSQL = 'SELECT ev."ID", ev."Name", ev."ImgPath", ev."DateFrom", sd."Name" as "StadiumName" FROM public."tEvent" ev join public."tStadium" sd on sd."ID" = ev."IDStadium" where ev."IDStatus" = 1';
		sSQL = 'SELECT ev."ID", ev."Name", ev."ImgPath", TO_CHAR(ev."DateFrom", \'DD-MM-YYYY HH24:MI:SS\') as "DateFrom", '+
					'TO_CHAR(ev."Dateto", \'DD-MM-YYYY HH24:MI:SS\') as "Dateto", ev."IDStadium", '+
					'sd."Name" as "Stadium" '+
					'FROM public."tEvent" ev '+
					'join public."tStadium" sd on ev."IDStadium" = sd."ID" '+
					'where ev."IDStatus" = 1 /*and ev."Dateto" >= now()*/ '+
					'order by ev."DateFrom", ev."ID" ';
		console.log(sSQL);
		db.db.any(sSQL)
			.then(function(data){
				console.log('events found:');
				console.log(data);
				sessData.eventsList = data;
				events = data;
				console.log('events: '+ JSON.stringify(events));

				console.log('rendering page...');
				console.log('sLogin='+sLogin);
				res.render('events', {title: 'Покупка билетов', userLogin: sLogin, eventsList: events, api: sessData.api || false});
			})
			.catch(function(err){
				//return next(err);
				console.log('error of search actual events:');
				console.log(err);
			});
	});

	//получение список актуальных мероприятий в формате json
	router.get('/getevents', function(req, res, next){
		console.log("get: /getevents");
		var events = {};
		var sSQL = "";
		sSQL = 'SELECT ev."ID", ev."Name", ev."ImgPath", TO_CHAR(ev."DateFrom", \'DD-MM-YYYY HH24:MI:SS\') as "DateFrom", '+
					'TO_CHAR(ev."Dateto", \'DD-MM-YYYY HH24:MI:SS\') as "Dateto", ev."IDStadium", '+
					'sd."Name" as "Stadium" '+
					'FROM public."tEvent" ev '+
					'join public."tStadium" sd on ev."IDStadium" = sd."ID" '+
					'where ev."IDStatus" = 1 /*and ev."Dateto" >= now()*/ '+
					'order by ev."DateFrom", ev."ID" ';
		//console.log(sSQL);
		db.db.any(sSQL)
			.then(function(data){
				//console.log('ticketsList: '+ JSON.stringify(data));
				console.log('events found:');
				events = data;
				res.status(200)
					.json({
						status: 'success',
						message: 'events found',
						events: events
					});
			})
			.catch(function(err){
				//return next(err);
				console.log('error of search actual events:');
				console.log(err);
				res.status(err.status)
					.json({
						status: 'error',
						message: 'events not found',
						events: {}
					});
			});
	});

	//авторизация кассира и открытие страницы со списом мероприятий
	router.post('/events', function(req, res, next){
		//наверное это должна была быть "router.post('/', ...)"
		
		console.log("post: /events");
		var sLogin = "";
		var nUserID = 0;
		var events = {};
		var sSQL = "";
		var sessData = req.session;
		if(sessData.userLogin){
			sLogin = sessData.userLogin;
			nUserID = sessData.userID;

			console.log('sLogin='+sLogin);

			//sSQL = 'SELECT ev."ID", ev."Name", ev."ImgPath", ev."DateFrom", sd."Name" as "StadiumName" FROM public."tEvent" ev join public."tStadium" sd on sd."ID" = ev."IDStadium" where ev."IDStatus" = 1';
			sSQL = 'SELECT ev."ID", ev."Name", ev."ImgPath", TO_CHAR(ev."DateFrom", \'DD-MM-YYYY HH24:MI:SS\') as "DateFrom", '+
					'TO_CHAR(ev."Dateto", \'DD-MM-YYYY HH24:MI:SS\') as "Dateto", ev."IDStadium", '+
					'sd."Name" as "Stadium" '+
					'FROM public."tEvent" ev '+
					'join public."tStadium" sd on ev."IDStadium" = sd."ID" '+
					'where ev."IDStatus" = 1 /*and ev."Dateto" >= now()*/ '+
					'order by ev."DateFrom", ev."ID" ';
			console.log(sSQL);
			db.db.any(sSQL)
				.then(function(data){
					console.log('events found:');
					console.log(data);
					sessData.eventsList = data;
					events = data;
					console.log('events: '+ JSON.stringify(events));

					console.log('rendering page...');
					console.log('sLogin='+sLogin);
					res.render('events', {title: 'Учет билетов', userLogin: sLogin, eventsList: events});
				})
				.catch(function(err){
					//return next(err);
					console.log('error of search actual events:');
					console.log(err);
				});
		}
		
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
		console.log(sessData)

		if ( sessData.cashier ){
			res.redirect('/kassa/beta/event/' + eventID);
			return;
		}
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

					res.render('eventmap', {title: 'Учет билетов', userLogin: sLogin, eventsList: events, eventID: eventID});
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
		res.render('eventmap', {title: 'Учет билетов', userLogin: sLogin, eventsList: events, eventID: eventID});
	})



	//эта функция не используется, создавал для работы со схемой зала
	router.get('/maps/:idevent', function(req, res, next){
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
	});
	
	
}