let formidable = require('formidable');

module.exports = (router, dbUtils, sAdminPageTitle) => {

	//открытие страницы "localhost:3000/admin/events", отображение списка мероприятий
	router.get('/events', function(req, res, next) {
		let sAdminLogin = "",
			sessData 	= req.session;


		console.log("GET /admin/events");
		if(sessData.adminLogin){
			sAdminLogin = sessData.adminLogin;
		}
		else {
			res.redirect('/admin');
			return;
		}

		dbUtils.Event.getAll((events) => {
			res.render('adminevents', {title: sAdminPageTitle, adminLogin: sAdminLogin, eventsList: events});
		})
	});

	router.post('/events', function(req, res, next) {
		let sAdminLogin = "",
			sessData 	= req.session;


		console.log("POST /admin/events");
		if(sessData.adminLogin){
			sAdminLogin = sessData.adminLogin;
		}
		else {
			res.redirect('/admin');
			return;
		}

		let postOperation = req.body.postOperation;
		dbUtils.Event.insert(postOperation, (ans) => {
			res.send(ans);
		})
	});


	//открытие страницы редактирования одного мероприятия "localhost:3000/admin/event/123", где 123 это идентификатор мероприятия
	router.get('/event/:id', function(req, res, next) {
		let sAdminLogin = "",
			sessData 	= req.session;


		console.log("GET /admin/event/id");
		if(sessData.adminLogin){
			sAdminLogin = sessData.adminLogin;
		}
		else {
			res.redirect('/admin');
			return;
		}

		let nID 		= req.params.id,
			rowEventData = {},
			stadiumList = {},
			sectorList = {};

		dbUtils.Event.getById(nID, (rowEventData, qres) => {
			console.log('rowEventData.IDStadium='+rowEventData.IDStadium);
			dbUtils.Stadium.getNameID((stadiumList) => {
				if (typeof rowEventData.IDStadium === 'undefined') {
					
				}
				let nIDStadiumEvent = rowEventData.IDStadium || 0;
				
				dbUtils.Seat.customSelect(nID, nIDStadiumEvent, (sectorList) => {
					
					dbUtils.Seat.getByStadiumID(nID, nIDStadiumEvent, (rowList) => {
						//console.log(rowList);
						let mainPrices = Object;
						sectorList.forEach((item, i, array) => {
							mainPrices[item.SectorName] = [];
						})
						rowList.forEach((item, i, array) => {
							sectorList.forEach((sector, i, array) => {
								if ( sector.SectorName == item.SectorName ){
									mainPrices[sector.SectorName].push({
										RowN: item.RowN,
										Price: item.Price
									});
								}
							})
						})
						//console.log(mainPrices);
						res.render('admineventedit', {
							title: sAdminPageTitle, 
							adminLogin: sAdminLogin, 
							eventData: rowEventData, 
							eventID: nID, 
							stadiums: stadiumList, 
							sectors: sectorList, 
							rownums: mainPrices
						});
					});
				});
			});
		});
	});

	//сохранение изменений мероприятия
	router.post('/event/:id', function(req, res, next) {
		let sAdminLogin = "",
			sessData 	= req.session;


		console.log("POST /admin/event/id");
		if(sessData.adminLogin){
			sAdminLogin = sessData.adminLogin;
		}
		else {
			res.redirect('/admin');
			return;
		}
		
		if(!req.body){
			console.log("req.body is null. Redirect to event/id...");
			res.send('req.body is null');
			return;
		}

		let eventData = {
			nID: 			req.params.id,
			sPostOperation: req.body.postOperation,
			sEventName: 	req.body.eventName,
			sImgPath: 		req.body.eventAfisha,
			sDateFrom: 		req.body.eventDateFrom,
			nStadiumID: 	req.body.stadiumID,
			bshowOnline: 	req.body.showOnline,
			bshowCasher: 	req.body.showCasher,
			bshowAPI: 		req.body.showAPI
		};

		dbUtils.Event.update(eventData, (sResMsg) => {
			res.send(sResMsg);
		})
		// код в database/EventsUtils.js -> update ( разработка )
	});

	//картинки для афиши мероприятий отображаются только вот так:
	router.get('/images/events/:imgname', function(req, res, next){
		var sImgName = req.params.imgname;
		res.send(sImgName);
	});
	

	//загрузка файла с картинкой афиши мероприятия (лишь копируем файл в спецпапку на сервере, но не сохраняем путь в БД)
	router.post('/uploadeventimg', function(req, res, next){
		let form = new formidable.IncomingForm();
	    form.parse(req);
	    form.on('fileBegin', function (name, file){
	        file.path = __basedir + '/public/images/events/' + file.name;
			sFilename = file.name;
	    });
	    form.on('file', function (name, file){
	        console.log('Uploaded ' + file.name);
			res.send(file.name);
			return;
	    });
		form.on('error', function(err) {
			console.error(err);
			return res.send('error: '+err);
		});
	    res.status(200);
	});


	router.get('/eventGetStatus/:id', function(req, res, next){
		let nID = req.params.id;

		dbUtils.Event.getStatus(nID, (rowEventData) => {
			res.json(rowEventData);
		})
		
	});
}