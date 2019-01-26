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
				res.render('adminAbonementsAdd', {title: sAdminPageTitle, adminLogin: sAdminLogin, evensList: events, seats: seats}); 
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
					evensIDs: null
				};
				console.log(itemData)
				if ( typeof(formData.evens) == 'string' ) itemData.evensIDs = formData.evens;
				else itemData.evensIDs = formData.evens.join();

				dbUtils.Ticket.getBySeat({ IDSeat: itemData.SeatID, events: itemData.evensIDs }, (tickets) => {
					console.log("ANSWER FROM getBySeat");
					console.log(tickets);
					if ( tickets.length != itemData.evensIDs )  {
						res.json({err: "Ошибка"})
						return;
					}
					else {
						tickets.forEach((item) => {
							if (item.IDStatus != 3) { 
								res.json({err: "Ошибка"}) 
								return;
							}
						})
						dbUtils.Ticket.multiStatus({tickets: tickets}, (ans) => {
							console.log("ANSWER FROM multiStatus");
							dbUtils.Abonement.insert(itemData, () => { res.redirect('/admin/abonements/add'); })
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
	
}