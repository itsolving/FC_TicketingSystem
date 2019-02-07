let Templator 	 = require(`${__basedir}/helpers/Templator.js`),
	templator 	 = new Templator(),
	xl 			 = require('excel4node');

module.exports = (router, dbUtils, sAdminPageTitle) => {

	// изменение прайса на билетах ( NEW BETA )
	router.post('/ticket/changeprice/', function(req, res){
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

		let data = {
			nEventID: 		req.body.nEventID,
			newPrice: 		req.body.newPrice,
			rowN: 			req.body.rowN,
			sector: 		req.body.sector
		};

		dbUtils.Ticket.updatePrice(data.nEventID, [{name: data.sector, price: data.newPrice, RowN: data.rowN}], (ans) => {
			console.log(ans);
		})
	})


	//	Экспорт/Выгрузка штрих кодов в excel файл 
	router.get('/tickets/barcode/export', function(req, res){
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
			res.render('adminBarcodeExport', { title: sAdminPageTitle, adminLogin: sAdminLogin, events: events });
		})
	})

	router.post('/tickets/barcode/export', function(req, res){

		// let sAdminLogin = "",
		// 	sessData 	= req.session;


		// console.log("GET /admin/reports");
		// if(sessData.admControl){
	 //        sAdminLogin = sessData.admControl.Login;
  //       }
		// else {
		// 	res.redirect('/admin');
		// 	return;
		// }

		dbUtils.Ticket.getSaled({IDEvent: req.body.event}, (tickets) => {
			let wb = new xl.Workbook();
			wb.write('result.xlsx');
			let ws = wb.addWorksheet('Sheet 1');
			for ( let i = 1; i < tickets.length+1; i++ ){
				 ws.cell(i, 1).string(tickets[i-1].Barcode);
			}
			//res.json(tickets);
			wb.write('result.xlsx', res);
		})
	})

}