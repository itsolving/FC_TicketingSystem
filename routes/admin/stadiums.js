module.exports = (router, dbUtils, sAdminPageTitle) => {

	//это нужно для jquery чтобы проставить значения в выпадающий список поля "стадионы"
	router.get('/stadiumsJson', function(req, res, next) {
		console.log("GET /admin/stadiumsjson");

		dbUtils.Stadium.getNameID((stadiumList) => {
			res.json(stadiumList);
		})
		
	});

	//открытие страницы со списком стадионов
	router.get('/stadiums', function(req, res, next) {
		let sAdminLogin = "",
			sessData 	= req.session;


		console.log("GET /admin/stadiums");
		if(sessData.admControl){
	        sAdminLogin = sessData.admControl.Login;
        }
		else {
			res.redirect('/admin');
			return;
		}
		dbUtils.Stadium.getAll((stadiums) => {
			res.render('adminstadiums', {title: sAdminPageTitle, adminLogin: sAdminLogin, stadiumsList: stadiums});
		})
		
	});

	//если зашли на адрес "localhost:3000/admin/stadium/123" где 123 это идентификатор стадиона
	router.get('/stadium/:id', function(req, res, next) {
		let sAdminLogin = "",
			sessData 	= req.session;


		console.log("GET /admin/stradium/id");
		if(sessData.admControl){
	        sAdminLogin = sessData.admControl.Login;
        }
		else {
			res.redirect('/admin');
			return;
		}
		let nID = req.params.id;
		dbUtils.Stadium.getByID(nID, (rowStadiumData) => {
			dbUtils.City.getNameID((cityList => {
				res.render('adminstadiumedit', { 
					title: sAdminPageTitle, 
					adminLogin: sAdminLogin, 
					stadiumData: rowStadiumData, 
					stadiumID: nID, 
					cities: cityList
				});
			}))
		});
	});

	//сохранение изменений по стадиону
	router.post('/stadium/:id', function(req, res, next) {
		let sAdminLogin = "",
			sessData 	= req.session;


		console.log("POST /admin/stadium/id");
		if(sessData.admControl){
	        sAdminLogin = sessData.admControl.Login;
        }
		else {
			res.redirect('/admin');
			return;
		}

		let nID 		   = req.body.id,
			rowStadiumData = {},
			cityList 	   = {},
			client 		   = new Client(conOptions);

		client.connect();
		
		res.send('Стадион не сохранен!');
		
		//пока не готово
		var sSQL = `update public."tStadium" set ... where sd."ID" = ${nID}`;
		console.log(sSQL);
		/*client.query(sSQL, (qerr, qres) => {
			if (qerr) {
				console.log(qerr ? qerr.stack : qres);
			}
			else {
				//console.log(qerr ? qerr.stack : qres);
				
				if (typeof qres.rowCount === 'undefined') {
					console.log('res.rowCount not found');
				}
				else {
					if (qres.rowCount == 0) {
						console.log('res.rowCount='+qres.rowCount);
					}
					else {
						rowEventData = qres.rows;
					}
				}
			}
			client.end();
			res.render('admineventedit', {title: sAdminPageTitle, adminLogin: sAdminLogin, eventData: rowEventData, eventID: nID, stadiums: stadiumList});
		});*/
	});
}