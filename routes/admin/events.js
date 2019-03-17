module.exports = (router, dbUtils, sAdminPageTitle) => {

	//открытие страницы "localhost:3000/admin/events", отображение списка мероприятий
	router.get('/events', function(req, res, next) {
		let sAdminLogin = "",
			sessData 	= req.session;

			console.log(sessData);
		console.log("GET /admin/events");
		if(sessData.admControl){
			sAdminLogin = sessData.admControl.Login;
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
		if(sessData.admControl){
	        sAdminLogin = sessData.admControl.Login;
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
		if(sessData.admControl){
			sAdminLogin = sessData.admControl.Login;
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
				
				let nIDStadiumEvent = rowEventData[0].IDStadium || 0;
				
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
						dbUtils.Template.getAll((templates) => {
							dbUtils.PriceColor.getByEvent(rowEventData[0].ID, (colorData) => {
								console.log(colorData)
								res.render('admineventedit', {
									title: sAdminPageTitle, 
									adminLogin: sAdminLogin, 
									eventData: rowEventData, 
									eventID: nID, 
									stadiums: stadiumList, 
									sectors: sectorList, 
									rownums: mainPrices,
									templates: templates,
									priceColor: colorData
								});
							})
							
						})
						//console.log(mainPrices);
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
		if(sessData.admControl){
	        sAdminLogin = sessData.admControl.Login;
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
			nTemplateID:    req.body.templateID,
			bshowOnline: 	req.body.showOnline,
			bshowCasher: 	req.body.showCasher,
			bshowAPI: 		req.body.showAPI,
			MaxTickets:     req.body.MaxTickets
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

	    let ImgFile = req.files['img'];
	    ImgFile.mv(`${__dirname}/../../public/images/events/${ImgFile.name}`, function(err) {
		    if (err){
		    	console.log(err);
		    	return res.send('error: '+err);
		    }
		    res.send(`/images/events/${ImgFile.name}`);
		})
		 res.status(200);
	});


	router.get('/eventGetStatus/:id', function(req, res, next){
		let nID = req.params.id;

		dbUtils.Event.getStatus(nID, (rowEventData) => {
			res.json(rowEventData);
		})
		
	});

	router.get('/event/archive/:id', function(req, res, next){
		let sAdminLogin = "",
			sessData 	= req.session;


		console.log("POST /admin/event/id");
		if(sessData.admControl){
	        sAdminLogin = sessData.admControl.Login;
        }
		else {
			res.redirect('/admin');
			return;
		}
		let nID = req.params.id;
		dbUtils.Event.update({ sPostOperation: 'del', nID: nID },(data) => {
			res.redirect('/admin/events/');
		})
	})

	router.get('/event/clone/:id', function(req, res, next){
		let sAdminLogin = "",
			sessData 	= req.session;


		console.log("POST /admin/event/id");
		if(sessData.admControl){
	        sAdminLogin = sessData.admControl.Login;
        }
		else {
			res.redirect('/admin');
			return;
		}
		let nID = req.params.id;
		dbUtils.Event.getById(nID, (events) => {
			dbUtils.Event.create(events[0],(data) => {
				if ( data.ResultMsg != "ERROR!" ){
					res.redirect(`/admin/event/${data.ID}`);
				}
				else {
					res.json({err: data.ResultMsg});
				}
			})
		})
	})

	router.get('/events/new', function(req, res, next){
		let sAdminLogin = "",
			sessData 	= req.session;


		console.log("POST /admin/event/id");
		if(sessData.admControl){
	        sAdminLogin = sessData.admControl.Login;
        }
		else {
			res.redirect('/admin');
			return;
		}
		

		dbUtils.Template.getAll((templates) => {
			dbUtils.Stadium.getNameID((stadiums) => {
				res.render('adminEventNew', {
					title: sAdminPageTitle, 
					adminLogin: sAdminLogin, 
					templates: templates,
					stadiums: stadiums
				});
			})
		})


	})

	router.post('/events/new', function(req, res, next){
		let sAdminLogin = "",
			sessData 	= req.session;


		console.log("POST /admin/event/id");
		if(sessData.admControl){
	        sAdminLogin = sessData.admControl.Login;
        }
		else {
			res.redirect('/admin');
			return;
		}

		let eventData = {
			Name: 			req.body.eventName,
			ImgPath: 		req.body.eventAfisha,
			DateFrom: 		req.body.eventDateFrom,
			IDStadium: 		req.body.stadiumID,
			IDTemplate:     req.body.templateID,
			ShowOnline: 	req.body.showOnline,
			ShowCasher: 	req.body.showCasher,
			ShowAPI: 		req.body.showAPI,
			IDStatus: 		1,
			MaxTickets:     req.body.MaxTickets,
			IDUserCreator:  sessData.admControl.ID
		};

		dbUtils.Event.create(eventData,(data) => {
			res.json(data);
		})
		

		
	})
}