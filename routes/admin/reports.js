let builder = require('xmlbuilder'),
    xl 		= require('excel4node');

module.exports = (router, dbUtils, sAdminPageTitle) => {
	
	//при открытии страницы "localhost:3000/admin/reports"
	router.get('/reports', function(req, res, next){
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

		res.render('adminReports', { title: sAdminPageTitle, adminLogin: sAdminLogin });
	})

	//при открытии страницы "localhost:3000/admin/reports/trans"
	router.get('/reports/trans', function(req, res, next) {
		let sAdminLogin = "",
			sessData 	= req.session;


		console.log("GET /admin/reports/trans");
		if(sessData.admControl){
	        sAdminLogin = sessData.admControl.Login;
        }
		else {
			res.redirect('/admin');
			return;
		}

		dbUtils.Trans.getAll((trans) => {
			if ( !(trans.length > 0) ){ trans = []; }
			res.render('adminTrans', { title: sAdminPageTitle, adminLogin: sAdminLogin, transList: trans });
		})

	});

	//при открытии страницы "localhost:3000/admin/reports/trans/xml"
	router.get('/reports/trans/xml', function(req, res, next) {
		let sAdminLogin = "",
			sessData 	= req.session;


		console.log("GET /admin/reports/trans");
		if(sessData.admControl){
	        sAdminLogin = sessData.admControl.Login;
        }
		else {
			res.redirect('/admin');
			return;
		}

		dbUtils.Trans.getAll((trans) => {
			if ( !(trans.length > 0) ){ trans = []; }

			let obj = [];

			trans.forEach((item) => {
				obj.push({
		        'id': item.ID,
		        'saledate': item.Saledate,
		        'name': item.Name,
		        'sectorname': item.SectorName,
		        'rown': item.RowN,
		        'seatn': item.SeatN,
		        'statusname': item.StatusName,
		        'email': item.Email,
		        'price': item.Price
		      })
			})
			let transObj = { 
				'root': {
					'trans': [obj]
				}
			}

			let transXML = builder.create(transObj, { encoding: 'utf-8' })

			let resultXML = transXML.end({ pretty: true })
			res.type('application/xml');

			res.send(resultXML);
		
		})

	});

	router.get('/export', function(req, res, next){
		let sAdminLogin = "",
			sessData 	= req.session;


		console.log("GET /admin/reports/trans");
		if(sessData.admControl){
	        sAdminLogin = sessData.admControl.Login;
        }
		else {
			res.redirect('/admin');
			return;
		}

		dbUtils.Event.getNameId((events) => {
			res.render('adminExports', { title: sAdminPageTitle, adminLogin: sAdminLogin, events: events });
		})

	})

	router.post('/export', function(req, res, next){
		let sAdminLogin = "",
			sessData 	= req.session;


		console.log("GET /admin/reports/trans");
		if(sessData.admControl){
	        sAdminLogin = sessData.admControl.Login;
        }
		else {
			res.redirect('/admin');
			return;
		}


		let data = req.body;
		dbUtils.Trans.getAllFilters(data, (trans) => {
			if ( !(trans.length > 0) ){ trans = []; }

			let obj = [];

			trans.forEach((item) => {
				obj.push({
		        'id': item.ID,
		        'saledate': item.Saledate,
		        'name': item.Name,
		        'sectorname': item.SectorName,
		        'rown': item.RowN,
		        'seatn': item.SeatN,
		        'statusname': item.StatusName,
		        'email': item.Email,
		        'price': item.Price
		      })
			})
			let transObj = { 
				'root': {
					'trans': [obj]
				}
			}

			let transXML = builder.create(transObj, { encoding: 'utf-8' })


			let resultXML = transXML.end({ pretty: true })
			res.type('application/xml');
			res.writeHead(200, {
		        'Content-Type': 'application/xml',
		        'Content-disposition': 'attachment;filename=transactions.xml'
		    });
			res.end(resultXML);
		})
	})


	//при открытии страницы "localhost:3000/admin/reports/trans"
	router.get('/reports/users/payments', function(req, res, next) {
		let sAdminLogin = "",
			sessData 	= req.session;


		console.log("GET /admin/reports/users/payments");
		if(sessData.admControl){
	        sAdminLogin = sessData.admControl.Login;
        }
		else {
			res.redirect('/admin');
			return;
		}

		dbUtils.Payment.getAll(async (payments) => {
			if ( !(payments.length > 0) ){ 
				payments = []; 
				res.render('adminUserPayments', { title: sAdminPageTitle, adminLogin: sAdminLogin, payments: [] });
				return; 
			}
			else {
				res.render('adminUserPayments', { title: sAdminPageTitle, adminLogin: sAdminLogin, payments: payments });
			}
			
		})

	});

	router.get('/tickets/download/barcodes/excel/:IDEvent', function(req, res){

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

		dbUtils.Ticket.getCustomSaled({IDEvent: req.params.IDEvent}, (tickets) => {
			let wb = new xl.Workbook();
			wb.write('result.xlsx');
			let ws = wb.addWorksheet('Sheet 1');
			for ( let i = 1; i < tickets.length+1; i++ ){
				ws.cell(i, 1).string(tickets[i-1].ID.toString());
				ws.cell(i, 2).string(tickets[i-1].statusName);
				ws.cell(i, 3).string(tickets[i-1].Name);
				ws.cell(i, 4).string(tickets[i-1].DateFrom.toString());

				ws.cell(i, 5).string(tickets[i-1].SectorName);
				ws.cell(i, 6).string(tickets[i-1].RowN.toString());
				ws.cell(i, 7).string(tickets[i-1].SeatN.toString());
				ws.cell(i, 8).string(tickets[i-1].Price.toString());
			}
			//res.json(tickets);
			wb.write('Giveaway.xlsx', res);
		})
	})

}