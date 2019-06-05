let Templator 	 = require(`${__basedir}/helpers/Templator.js`),
	templator 	 = new Templator(),
	xl 			 = require('excel4node'),
	xlsx         = require('node-xlsx');

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

	router.get('/tickets/import', function(req, res){
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
			res.render('adminBarcodeImport', { title: sAdminPageTitle, adminLogin: sAdminLogin, events: events });
		})
	})

	router.post('/tickets/import', function(req, res){
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

		//console.log(req.files.xlsx);
		let workSheets = xlsx.parse(req.files.xlsx.data);
		//console.log(workSheets[0].data)
		//res.json(workSheets[0].data);

		let objData = [];

		workSheets[0].data.forEach((item) => {
			objData.push({
				IDEvent: req.body.event,
				Barcode: item[0],
				SectorName: item[1],
				RowN: item[2],
				SeatN: item[3],
				Price: item[4]
			})
		})

		dbUtils.Ticket.import({tickets: objData}, (result) => {
			console.log(result);
			res.json(result);

		})

		console.log(objData);
	})

	router.post('/tickets/new/changeprice', function(req, res){
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

		dbUtils.Ticket.setPriceByID(data, (ans) => {
			console.log(ans);
			res.json({success: true});
		})
	})

	router.post('/ticket/sectors/changeprice/:IDEvent', function(req, res){
		let data = req.body;

		let newData = {
			IDEvent: req.params.IDEvent,
			sectors: []
		}
		console.log(data);
		let stringParams = '';
		for ( var prop in data ){
		   stringParams = '[' + prop + ']';
		}

		let parsedData = JSON.parse(stringParams);

		newData.sectors = parsedData;

		dbUtils.Ticket.updatePriceSector(newData, (result) => {
			res.json({success: true});
		})


	})

	router.get('/tickets/download/barcodes/txt/:IDEvent', function(req, res){
		let sAdminLogin = "",
		sessData 	= req.session;


		console.log("GET /admin/tickets/download/barcodes/txt/:IDEvent");
		if(sessData.admControl){
	        sAdminLogin = sessData.admControl.Login;
        }
		else {
			res.redirect('/admin');
			return;
		}


		let IDEvent = req.params.IDEvent;

		dbUtils.Ticket.getBarcodesByEvent(IDEvent, (barcodes) => {
			let txtFile = '';
			console.log(barcodes)
			barcodes.forEach((item) => { txtFile = txtFile + item.Barcode + "\r\n"; })
			res.attachment(`Barcodes (IDEvent_${IDEvent}).txt`);
			res.type('txt');
			res.send(txtFile);
		})
	})

}