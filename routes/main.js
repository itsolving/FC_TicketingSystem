var express = require('express');
var router = express.Router();
var db = require('./queries');
var passwordHash = require('password-hash');
var fs = require('fs');



//страница авторизации кассира
router.get('/', function(req, res, next){
	console.log("get: /");
	var sLogin = "";
	var nUserID = 0;
	var events = {};
	var sessData = req.session;
	if(sessData.userLogin){
		sLogin = sessData.userLogin;
		nUserID = sessData.userID;
		events = sessData.eventsList;
	}

	//var events = db.getList(req, res, next);
	res.render('index', {title: 'Учет билетов', userLogin: sLogin, userID: nUserID, eventsList: events});
})

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
			res.render('events', {title: 'Покупка билетов', userLogin: sLogin, eventsList: events});
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
	else {
		var hashedPassword = passwordHash.generate(req.body.txPassword);
		console.log('req.body.txPassword='+req.body.txPassword+', hashedPassword = '+hashedPassword);
		sSQL = 'SELECT "ID", "Login", "Pwd" FROM public."tUser" where "isLock" = false and "IDRole" in (2,3,4) and "Login" = \''+req.body.txLogin+'\'';
		console.log(sSQL);
		db.db.any(sSQL)
			.then(function(data){
				console.log('data[0].Login='+data[0].Login+', data[0].Pwd='+data[0].Pwd);
				if (passwordHash.verify(req.body.txPassword, data[0].Pwd)) {
					console.log('user found:');
					console.log(data);
					sLogin = data[0].Login;
					nUserID = data[0].ID;
					sessData.userLogin = data[0].Login;
					sessData.userID = data[0].ID;
					console.log('sLogin='+sLogin);

					sSQL = 'SELECT "ID", "Name", "ImgPath", "DateFrom" FROM public."tEvent" where "IDStatus" = 1';
					console.log(sSQL);
					db.db.any(sSQL)
						.then(function(data){
							console.log('events found:');
							console.log(data);
							events = data;
							sessData.eventsList = data;
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
				else {
					res.redirect('/');
				}
			})
			.catch(function(err){
				//return next(err);
				console.log('error of search user:');
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
	/*else {
		res.redirect('/');
		return;
	}*/
	//if (sessData.eventsList){
		var sSQL = 'SELECT "ID", "Name", "ImgPath", "DateFrom" FROM public."tEvent" where "IDStatus" = 1';
		console.log(sSQL);
		db.db.any(sSQL)
			.then(function(data){
				console.log('events found:');
				console.log(data);
				sessData.eventsList = data;
				events = data;
				console.log('events: '+ JSON.stringify(events));

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

//эта функция не используется, создавалась для вебстраницы со схемой зала
router.get('/gettickets/:idevent', function(req, res){
	console.log('get /gettickets/idevent');
	var eventID = req.params.idevent;
	var ticketsList = {};
	console.log('eventID='+eventID);

	if (eventID !== 'undefined') {
		sSQL = 'select row_to_json(t) '
				+'from ( '
				+'	select "SectorName", "SectorRu", "minPrice", "maxPrice", "seatsLeft", '
				+'		( '
				+'			select array_to_json(array_agg(row_to_json(rw))) '
				+'			from '
				+'			( '
				+'				select "RowN", '
				+'					( '
				+'						select array_to_json(array_agg(row_to_json(tick))) '
				+'						from '
				+'						( '
				+'							select "IDSeat", "SeatN", "RowN", "SectorName", "SectorRu", "Tribune", "TicketID", "Barcode", "Price", "IDStatus", "StatusName" '
				+'							from ( '
				+'								SELECT t."Barcode", t."ID" as "TicketID", t."IDSeat", '
				+'									s."SeatN", s."RowN", '
				+'									t."Price"::numeric "Price", '
				+'									t."IDStatus", st."Name" "StatusName", '
				+'									s."Tribune", trim(s."SectorName") "SectorName", trim(s."SectorRu") "SectorRu" '
				+'								FROM public."tTicket" t '
				+'								join public."tSeat" s on t."IDSeat" = s."ID" '
				+'								join public."tStatus" st on t."IDStatus" = st."ID" '
				+'								where t."IDEvent" = '+eventID+' '
				+'								and t."IDStatus" in (3, 4, 5) '
				+'							) tick_all '
				+'							where "SectorName" = sectors."SectorName" and "RowN" = row_all."RowN" '
				+'						) tick '
				+'					) as "tickets" '
				+'				from '
				+'				( '
				+'					SELECT s."RowN", s."Tribune", trim(s."SectorName") "SectorName", trim(s."SectorRu") "SectorRu" '
				+'					FROM public."tSeat" s '
				+'					where 1=1 '
				+'					group by s."RowN", s."Tribune", trim(s."SectorName"), trim(s."SectorRu") '
				+'				) row_all '
				+'				where "SectorName" = sectors."SectorName" '
				+'			) rw '
				+'		) as "sector_rows" '
				+'	from ( '
				+'			SELECT trim(s."SectorName") "SectorName", trim(s."SectorRu") "SectorRu", '
				+'				min(t."Price"::numeric) "minPrice", '
				+'				max(t."Price"::numeric) "maxPrice", '
				+'				count(case when t."IDStatus" = 3 then t."Price"::numeric end) "seatsLeft" '
				+'			FROM public."tTicket" t '
				+'			join public."tSeat" s on t."IDSeat" = s."ID" '
				+'			where t."IDEvent" = '+eventID+' '
				+'			and t."IDStatus" in (3, 4, 5) '
				+'			group by trim(s."SectorName"), trim(s."SectorRu") '
				+'		) sectors '
				+'	where 1=1 '
				+') t ';
				
				/*'select row_to_json(t) '
				+'from ( '
				+'	select "SectorName", "minPrice", "maxPrice", "seatsLeft", '
				+'		( '
				+'			select array_to_json(array_agg(row_to_json(tick))) '
				+'			from ( '
				+'				select "Barcode", "TicketID", "IDSeat", "SeatN", "RowN", "Price", "IDStatus", "StatusName", "Tribune", "SectorName" '
				+'				from ( '
				+'					SELECT t."Barcode", t."ID" as "TicketID", t."IDSeat", '
				+'						s."SeatN", s."RowN", '
				+'						t."Price"::numeric "Price", '
				+'						t."IDStatus", st."Name" "StatusName", '
				+'						s."Tribune", trim(s."SectorName") "SectorName" '
				+'					FROM public."tTicket" t '
				+'					join public."tSeat" s on t."IDSeat" = s."ID" '
				+'					join public."tStatus" st on t."IDStatus" = st."ID" '
				+'					where t."IDEvent" = '+eventID+' '
				+'					and t."IDStatus" in (3, 4, 5) '
				+'				) tick_all '
				+'				where "Tribune" || "SectorName" = tribunes."SectorName" '
				+'			) tick '
				+'		) as "tickets" '
				+'	from ( '
				+'			SELECT s."Tribune" || trim(s."SectorName") "SectorName", '
				+'				min(t."Price"::numeric) "minPrice", '
				+'				max(t."Price"::numeric) "maxPrice", '
				+'				count(t."Price"::numeric) "seatsLeft" '
				+'			FROM public."tTicket" t '
				+'			join public."tSeat" s on t."IDSeat" = s."ID" '
				+'			where t."IDEvent" = '+eventID+' '
				+'			and t."IDStatus" = 3 '
				+'			group by s."Tribune" || trim(s."SectorName") '
				+'		) tribunes '
				+'	where 1=1 '
				+') t';*/

		console.log(sSQL);
		db.db.any(sSQL)
			.then(function(data){
				//console.log('ticketsList: '+ JSON.stringify(data));
				console.log('tickets found:');
				ticketsList = data;
				res.status(200)
					.json({
						ReqStatus: 'success',
						Message: 'tickets found',
						TicketData: data
					});
			})
			.catch(function(err){
				//return next(err);
				console.log('error of search actual tickets:');
				console.log(err);
				res.status(err.status)
					.json({
						ReqStatus: 'error',
						Message: 'tickets not found',
						TicketData: {}
					});
			});
	}
	else {
		res.status(404)
			.json({
				ReqStatus: 'error',
				Message: 'event not found, so no tickets',
				TicketData: {}
			});
	}
});

//(старая)получение всех билетов по указанному мероприятию, используется в схеме зала
router.post('/gettickets', function(req, res){
	console.log('post /gettickets');
	var eventID = req.body.IDEvent;
	var ticketsList = {};
	console.log('eventID='+eventID);

	if (eventID !== 'undefined') {
		sSQL = 'select row_to_json(t) '
				+'from ( '
				+'	select "SectorName", "SectorRu", "minPrice", "maxPrice", "seatsLeft", '
				+'		( '
				+'			select array_to_json(array_agg(row_to_json(rw))) '
				+'			from '
				+'			( '
				+'				select "RowN", '
				+'					( '
				+'						select array_to_json(array_agg(row_to_json(tick))) '
				+'						from '
				+'						( '
				+'							select "IDSeat", "SeatN", "RowN", "SectorName", "SectorRu", "Tribune", "TicketID", "Barcode", "Price", "IDStatus", "StatusName" '
				+'							from ( '
				+'								SELECT t."Barcode", t."ID" as "TicketID", t."IDSeat", '
				+'									s."SeatN", s."RowN", '
				+'									t."Price"::numeric "Price", '
				+'									t."IDStatus", st."Name" "StatusName", '
				+'									s."Tribune", trim(s."SectorName") "SectorName", trim(s."SectorRu") "SectorRu" '
				+'								FROM public."tTicket" t '
				+'								join public."tSeat" s on t."IDSeat" = s."ID" '
				+'								join public."tStatus" st on t."IDStatus" = st."ID" '
				+'								where t."IDEvent" = '+eventID+' '
				+'								and t."IDStatus" in (3, 4, 5) '
				+'							) tick_all '
				+'							where "SectorName" = sectors."SectorName" and "RowN" = row_all."RowN" '
				+'						) tick '
				+'					) as "tickets" '
				+'				from '
				+'				( '
				+'					SELECT s."RowN", s."Tribune", trim(s."SectorName") "SectorName", trim(s."SectorRu") "SectorRu" '
				+'					FROM public."tSeat" s '
				+'					where 1=1 '
				+'					group by s."RowN", s."Tribune", trim(s."SectorName"), trim(s."SectorRu") '
				+'				) row_all '
				+'				where "SectorName" = sectors."SectorName" '
				+'			) rw '
				+'		) as "sector_rows" '
				+'	from ( '
				+'			SELECT trim(s."SectorName") "SectorName", trim(s."SectorRu") "SectorRu", '
				+'				min(t."Price"::numeric) "minPrice", '
				+'				max(t."Price"::numeric) "maxPrice", '
				+'				count(case when t."IDStatus" = 3 then t."Price"::numeric end) "seatsLeft" '
				+'			FROM public."tTicket" t '
				+'			join public."tSeat" s on t."IDSeat" = s."ID" '
				+'			where t."IDEvent" = '+eventID+' '
				+'			and t."IDStatus" in (3, 4, 5) '
				+'			group by trim(s."SectorName"), trim(s."SectorRu") '
				+'		) sectors '
				+'	where 1=1 '
				+') t ';
				
				/*'select row_to_json(t) '
				+'from ( '
				+'	select "SectorName", "SectorRu", "minPrice", "maxPrice", "seatsLeft", '
				+'		( '
				+'			select array_to_json(array_agg(row_to_json(tick))) '
				+'			from ( '
				+'				select "Barcode", "TicketID", "IDSeat", "SeatN", "RowN", "Price", "IDStatus", "StatusName", "Tribune", "SectorName", "SectorRu" '
				+'				from ( '
				+'					SELECT t."Barcode", t."ID" as "TicketID", t."IDSeat", '
				+'						s."SeatN", s."RowN", '
				+'						t."Price"::numeric "Price", '
				+'						t."IDStatus", st."Name" "StatusName", '
				+'						s."Tribune", trim(s."SectorName") "SectorName", trim(s."SectorRu") "SectorRu" '
				+'					FROM public."tTicket" t '
				+'					join public."tSeat" s on t."IDSeat" = s."ID" '
				+'					join public."tStatus" st on t."IDStatus" = st."ID" '
				+'					where t."IDEvent" = '+eventID+' '
				+'					and t."IDStatus" in (3, 4, 5) '
				+'				) tick_all '
				+'				where "Tribune" || "SectorName" = tribunes."SectorName" '
				+'			) tick '
				+'		) as "tickets" '
				+'	from ( '
				+'			SELECT trim(s."SectorName") "SectorName", trim("SectorRu") "SectorRu", '
				+'				min(t."Price"::numeric) "minPrice", '
				+'				max(t."Price"::numeric) "maxPrice", '
				+'				count(case when t."IDStatus" = 3 then t."Price"::numeric end) "seatsLeft" '
				+'			FROM public."tTicket" t '
				+'			join public."tSeat" s on t."IDSeat" = s."ID" '
				+'			where t."IDEvent" = '+eventID+' '
				+'			and t."IDStatus" in (3, 4, 5) '
				+'			group by trim(s."SectorName"), trim("SectorRu") '
				+'		) tribunes '
				+'	where 1=1 '
				+') t';*/
		console.log(sSQL);
		db.db.any(sSQL)
			.then(function(data){
				//console.log('ticketsList: '+ JSON.stringify(data));
				console.log('tickets found:');
				ticketsList = data;
				res.status(200)
					.json({
						ReqStatus: 'success',
						Message: 'tickets found',
						TicketData: data
					});
			})
			.catch(function(err){
				//return next(err);
				console.log('error of search actual tickets:');
				console.log(err);
				res.status(err.status)
					.json({
						ReqStatus: 'error',
						Message: 'tickets not found',
						TicketData: {}
					});
			});
	}
	else {
		res.status(404)
			.json({
				ReqStatus: 'error',
				Message: 'event not found, so no tickets',
				TicketData: {}
			});
	}
});



//(новая)получение всех билетов по указанному мероприятию, используется в схеме зала
router.post('/getsectortickets', function(req, res){
//получение json-списка билетов по указанному сектору
	console.log('post /getsectortickets');
	var eventID = req.body.IDEvent;
	var sectorName = req.body.SectorName;
	var ticketsList = {};
	console.log('eventID='+eventID);

	if (eventID !== 'undefined') {
		sSQL = 'select row_to_json(t) '
				+'from ( '
				+'	select "SectorName", "SectorRu", "minPrice", "maxPrice", "seatsLeft", '
				+'		( '
				+'			select array_to_json(array_agg(row_to_json(rw))) '
				+'			from '
				+'			( '
				+'				select "RowN", '
				+'					( '
				+'						select array_to_json(array_agg(row_to_json(tick))) '
				+'						from '
				+'						( '
				+'							select "IDSeat", "SeatN", "RowN", "SectorName", "SectorRu", "Tribune", "TicketID", "Barcode", "Price", "IDStatus", "StatusName" '
				+'							from ( '
				+'								SELECT t."Barcode", t."ID" as "TicketID", t."IDSeat", '
				+'									s."SeatN", s."RowN", '
				+'									t."Price"::numeric "Price", '
				+'									t."IDStatus", st."Name" "StatusName", '
				+'									s."Tribune", trim(s."SectorName") "SectorName", trim(s."SectorRu") "SectorRu" '
				+'								FROM public."tTicket" t '
				+'								join public."tSeat" s on t."IDSeat" = s."ID" and trim(s."SectorName") = \''+sectorName+'\' '
				+'								join public."tStatus" st on t."IDStatus" = st."ID" '
				+'								where t."IDEvent" = '+eventID+' '
				+'								and t."IDStatus" in (3, 4, 5) '
				+'							) tick_all '
				+'							where "SectorName" = sectors."SectorName" and "RowN" = row_all."RowN" '
				+'						) tick '
				+'					) as "tickets" '
				+'				from '
				+'				( '
				+'					SELECT s."RowN", s."Tribune", trim(s."SectorName") "SectorName", trim(s."SectorRu") "SectorRu" '
				+'					FROM public."tSeat" s '
				+'					where trim(s."SectorName") = \''+sectorName+'\' '
				+'					group by s."RowN", s."Tribune", trim(s."SectorName"), trim(s."SectorRu") '
				+'				) row_all '
				+'				where "SectorName" = sectors."SectorName" '
				+'			) rw '
				+'		) as "sector_rows" '
				+'	from ( '
				+'			SELECT trim(s."SectorName") "SectorName", trim(s."SectorRu") "SectorRu", '
				+'				min(t."Price"::numeric) "minPrice", '
				+'				max(t."Price"::numeric) "maxPrice", '
				+'				count(case when t."IDStatus" = 3 then t."Price"::numeric end) "seatsLeft" '
				+'			FROM public."tTicket" t '
				+'			join public."tSeat" s on t."IDSeat" = s."ID" and trim(s."SectorName") = \''+sectorName+'\' '
				+'			where t."IDEvent" = '+eventID+' '
				+'			and t."IDStatus" in (3, 4, 5) '
				+'			group by trim(s."SectorName"), trim(s."SectorRu") '
				+'		) sectors '
				+'	where 1=1 '
				+') t ';
		/*'select row_to_json(t) '
				+'from ( '
				+'	select "SectorName", "SectorRu", "minPrice", "maxPrice", "seatsLeft", '
				+'		( '
				+'			select array_to_json(array_agg(row_to_json(tick))) '
				+'			from ( '
				+'				select "Barcode", "TicketID", "IDSeat", "SeatN", "RowN", "Price", "IDStatus", "StatusName", "Tribune", "SectorName", "SectorRu" '
				+'				from ( '
				+'					SELECT t."Barcode", t."ID" as "TicketID", t."IDSeat", '
				+'						s."SeatN", s."RowN", '
				+'						t."Price"::numeric "Price", '
				+'						t."IDStatus", st."Name" "StatusName", '
				+'						s."Tribune", trim(s."SectorName") "SectorName", trim(s."SectorRu") "SectorRu" '
				+'					FROM public."tTicket" t '
				+'					join public."tSeat" s on t."IDSeat" = s."ID" and trim(s."SectorName") = \''+sectorName+'\' '
				+'					join public."tStatus" st on t."IDStatus" = st."ID" '
				+'					where t."IDEvent" = '+eventID+' '
				+'					and t."IDStatus" in (3, 4, 5) '
				+'				) tick_all '
				+'				where "SectorName" = tribunes."SectorName" '
				+'			) tick '
				+'		) as "tickets" '
				+'	from ( '
				+'			SELECT trim(s."SectorName") "SectorName", trim(s."SectorRu") "SectorRu", '
				+'				min(t."Price"::numeric) "minPrice", '
				+'				max(t."Price"::numeric) "maxPrice", '
				+'				count(case when t."IDStatus" = 3 then t."Price"::numeric end) "seatsLeft" '
				+'			FROM public."tTicket" t '
				+'			join public."tSeat" s on t."IDSeat" = s."ID" and trim(s."SectorName") = \''+sectorName+'\' '
				+'			where t."IDEvent" = '+eventID+' '
				+'			and t."IDStatus" in (3, 4, 5) '
				+'			group by trim(s."SectorName"), trim(s."SectorRu") '
				+'		) tribunes '
				+'	where 1=1 '
				+') t';*/
		console.log(sSQL);
		db.db.any(sSQL)
			.then(function(data){
				//console.log('ticketsList: '+ JSON.stringify(data));
				console.log('tickets found:');
				ticketsList = data;
				res.status(200)
					.json({
						ReqStatus: 'success',
						Message: 'tickets found',
						TicketData: data
					});
			})
			.catch(function(err){
				//return next(err);
				console.log('error of search actual tickets:');
				console.log(err);
				res.status(err.status)
					.json({
						ReqStatus: 'error',
						Message: 'tickets not found',
						TicketData: {}
					});
			});
	}
	else {
		res.status(404)
			.json({
				ReqStatus: 'error',
				Message: 'event not found, so no tickets',
				TicketData: {}
			});
	}
});

//сохранение факта продажи билетов из схемы зала по указанному мероприятию
router.post('/sendsaledtickets', function(req, res){
	console.log('post /sendsaledtickets');
	
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
	
	var eventID = req.body.IDEvent;
	var sectorName = req.body.SectorName;
	var checkedSeats = req.body.CheckedSeats;
	
	var ticketsList = {};
	var sSQL = "";
	var sSQLTrans = "";
	var sSQLTickets = "";
	
	console.log('eventID='+eventID+', sectorName='+sectorName);
	console.log(checkedSeats);
	
	if (eventID !== 'undefined') {
		sSQL = "";
		checkedSeats.forEach(function(seat) {
			var rowN = seat.RowN;
			var seatN = seat.SeatN;
			var seatPrice = seat.Price;
			var sUpdate = 'update public."tTicket" set "IDStatus" = 5 where "IDSeat" in (select s."ID" from public."tSeat" s where s."SectorName" = \''+sectorName+'\' and s."RowN" = '+rowN+' and s."SeatN" = '+seatN+') and "IDEvent" = '+nEventID+';';
			sSQL = sSQL + sUpdate;
		});
		
		//console.log(sSQL);
		db.db.any(sSQL)
			.then(function(){
				//console.log('ticketsList: '+ JSON.stringify(data));
				console.log('saled tickets statuses updated');
				
				sSQLTickets = 'select "ID", "IDStatus", "IDSeat", "IDEvent" from public."tTicket" where "IDStatus" = 5 and "IDSeat" in (select s."ID" from public."tSeat" s where s."SectorName" = \''+sectorName+'\' and s."RowN" = '+rowN+' and s."SeatN" = '+seatN+') and "IDEvent" = '+nEventID+';';
				db.db.any(sSQLTickets)
					.then(function(tickets){
						sSQLTrans = "";
						tickets.forEach(function(tick) {
							var ticketID = tick.ID;
							
							// TODO: how to get value of idticket?
							var sTransInsert = 'insert into public."tTrans" ( "IDTicket", "Saledate", "IDUserSaler" ) values '
												+'( '+ticketID+', now(), '+nUserID+' ); ';
							sSQLTrans = sSQLTrans + sTransInsert;
						});
						db.db.any(sSQLTrans)
							.then(function(){
								console.log('transactions inserted');
								res.status(200)
									.json({
										ReqStatus: 'success',
										Message: 'saled tickets saved and transactions created'
									});
							})
							.catch(function(errInsTr){
								console.log('error of insert transactions of saled tickets:');
								console.log(errInsTr);
								res.status(errInsTr.status)
									.json({
										ReqStatus: 'error',
										Message: 'cannot create transactions for saled tickets, event '+nEventID
									});
							});
					})
					.catch(function(errSrchTick){
						console.log('error of search saled tickets:');
						console.log(errSrchTick);
						res.status(errSrchTick.status)
							.json({
								ReqStatus: 'error',
								Message: 'cannot find saled tickets for event '+nEventID
							});
					});
				
				
				
			})
			.catch(function(err){
				//return next(err);
				console.log('error of update saled tickets:');
				console.log(err);
				res.status(err.status)
					.json({
						ReqStatus: 'error',
						Message: 'saling tickets not saved'
					});
			});
	}
	else {
		res.status(404)
			.json({
				ReqStatus: 'error',
				Message: 'event not found, so no tickets updated'
			});
	}
});


//выход из сессии
router.get('/exit', function(req, res){
	req.session.destroy(function(err) {
		if(err){throw err;}
	});
	res.redirect('/');
});




module.exports = router;
