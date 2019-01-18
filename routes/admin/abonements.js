module.exports = (router, dbUtils, sAdminPageTitle) => {

	//при открытии страницы "localhost:3000/admin/abonements"
	router.get('/abonements', function(req, res, next){
		let sAdminLogin = "",
			sessData 	= req.session;


		console.log("GET /admin/reports");
		if(sessData.admControl){
	        sAdminLogin = sessData.admControl.Login;
        }
		else {
			res.redirect('/admin');
			return;
		}

		dbUtils.Abonement.getAll((abonements) => {
			console.log(abonements)
			if ( !(abonements.length > 0) ){ abonements = []; }
			res.render('adminAbonements', {title: sAdminPageTitle, adminLogin: sAdminLogin, abonList: abonements});
		})

	})

	//при открытии страницы "localhost:3000/admin/reports/add"
	router.get('/abonements/add', function(req, res, next){
		let sAdminLogin = "",
			sessData 	= req.session;


		console.log("GET /admin/reports");
		if(sessData.admControl){
	        sAdminLogin = sessData.admControl.Login;
        }
		else {
			res.redirect('/admin');
			return;
		}

		dbUtils.Event.getNameId((events) => { 
			res.render('adminAbonementsAdd', {title: sAdminPageTitle, adminLogin: sAdminLogin, evensList: events}); 
		})


	})

	//создание абонемента
	router.post('/abonements/add', function(req, res, next){
		let sAdminLogin = "",
			sessData 	= req.session;


		console.log("GET /admin/reports");
		if(sessData.admControl){
	        sAdminLogin = sessData.admControl.Login;
        }
		else {
			res.redirect('/admin');
			return;
		}

		let formData = req.body;

		console.log(formData)

		let seatData = {
			seatID: null,
			SectorName: (formData.tribune + formData.sector).toUpperCase(),
			RowN: formData.row,
			SeatN: formData.seat
		};
		console.log(seatData)
		dbUtils.Seat.getByPosition(seatData, (data) => {
			if ( data != null ){
				let itemData = {
					Price: formData.price,
					SectorName: data.SectorName,
					SeatID: data.seatID,
					RowN: data.RowN,
					SeatN: data.SeatN,
					evensIDs: null
				};
				console.log(itemData)
				if ( typeof(formData.evens) == 'string' ) itemData.evensIDs = formData.evens;
				else itemData.evensIDs = formData.evens.join()

				dbUtils.Abonement.insert(itemData, () => { res.redirect('/admin/abonements/add'); })
			}
			else {
				console.log("error Seat.getByPosition");
				res.redirect('/admin/abonements/add');
			}

		});

	})
	
}