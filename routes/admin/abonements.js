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
			dbUtils.Seat.customSelect(null, events[0].IDStadium, (seats) => {
				dbUtils.Stadium.getAll((stadiums) => {
					res.render('adminAbonementsAdd', {title: sAdminPageTitle, adminLogin: sAdminLogin, evensList: events, seats: seats, stadiums: stadiums}); 
				})
				
			})
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
			SectorName: formData.sector,
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
					evensIDs: []
				};
				
				if ( typeof(formData.evens) == 'string' ) itemData.evensIDs.push(formData.evens);
				else itemData.evensIDs = [...formData.evens];

				console.log(itemData)

				dbUtils.Ticket.getBySeat({ IDSeat: itemData.SeatID, events: itemData.evensIDs }, (tickets) => {
					console.log("ANSWER FROM getBySeat");
					console.log(tickets);
					if ( tickets.length != itemData.evensIDs.length )  {
						res.json({err: "Ошибка нахождения билетов"})
						return;
					}
					else {
						let ticketsIDs = [];

						tickets.forEach((item) => {
							if (item.IDStatus != 3) { 
								res.json({err: "Ошибка статусов"}) 
								return;
							}
							ticketsIDs.push(item.ID);
						})
						

						dbUtils.Ticket.multiStatus(ticketsIDs, 5, (ans) => {
							console.log("ANSWER FROM multiStatus");
							dbUtils.Abonement.insert(itemData, () => { res.redirect('/admin/abonements/'); })
						})
					}
				})

				// dbUtils.Abonement.insert(itemData, () => { res.redirect('/admin/abonements/add'); })
			}
			else {
				console.log("error Seat.getByPosition");
				res.redirect('/admin/abonements/');
			}

		});

	})

	router.post('/abonements/get/rown', function(req, res){
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
		let data = req.body;
		//res.json(data);
		dbUtils.Seat.getRowNByParams({SectorName: data.SectorName, IDStadium: parseInt(data.IDStadium)}, (ans) => {
			res.json(ans);
		})
		
	})

	router.post('/abonements/get/seatn', function(req, res){
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
		let data = req.body;
		dbUtils.Seat.getSeatNByParams({SectorName: data.SectorName, IDStadium: parseInt(data.IDStadium), RowN: data.RowN}, (ans) => {
			res.json(ans);
		})
	})

	router.post('/abonements/get/sectors', function(req, res){
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
		let data = req.body;
		console.log(data);
		dbUtils.Seat.customSelect(null, data.IDStadium, (sectors) => {
			res.json(sectors);
		})
	})
	
}