let dbUtils 	 = require('./../../database/DatabaseUtils.js'),
    Templator 	 = require(`${__basedir}/helpers/Templator.js`),
	templator 	 = new Templator();

module.exports = (router, db, PageTitle, dbUtils) => {

	//дополнительная проверка билетов
	// оставил в коде, может еще понадобиться 
	router.post('/ticket/approve', function(req, res, next){
		console.log('post /kassa/beta/ticket/approve');
		//данные из сессии
		var sLogin = "";
		var nUserID = 0;
		var events = {};
		var sessData = req.session;
		if(sessData.cashier){
			sLogin = sessData.userLogin;
			nUserID = sessData.userID;
			events = sessData.eventsList;
		}
		else {
			res.redirect('/');
			//res.json({err: "no success"});
			return;
		}
		let params = req.body;
		params = JSON.stringify(params);
		params = JSON.parse(params);
		if ((typeof params['tickets[]']) == 'string' ) params['tickets[]'] = [params['tickets[]']];
		
		// 4 status - резерв ( в данном случае - кассовый резерв )
		var sSQL = `SELECT tic."IDStatus", tic."ID"
						FROM public."tTicket" tic
						where "ID" in (${params['tickets[]']})`;
		db.db.any(sSQL)
			.then((data) => {
				console.log(data);
				let errTickets = [];
				data.forEach((ticket) => {
					if (ticket.IDStatus != 3) errTickets.push(ticket.ID);
				})
				if ( errTickets.length == 0 ){
					// approve всех билетов произошел
					res.json({success: true})
				}
				else {
					res.json({success: false, errTickets: errTickets});
					console.log(errTickets);
				}
			})
	});

	// покупка билетов
	router.post('/ticket/reserve/', function(req, res, next){
		//данные из сессии
		var sLogin = "";
		var nUserID = 0;
		var events = {};
		var sessData = req.session;
		if(sessData.cashier){
			sLogin = sessData.userLogin;
			nUserID = sessData.userID;
			events = sessData.eventsList;
		}
		else {
			res.redirect('/');
			//res.json({err: "no success"});
			return;
		}
		// нужна проверка на авторизацию кассы
		let params = req.body;
		params = JSON.stringify(params);
		params = JSON.parse(params);
		console.log(params);
		if ((typeof params['tickets[]']) == 'string' ) params['tickets[]'] = [params['tickets[]']];
		// 4 status - резерв ( в данном случае - кассовый резерв )
		var sSQLQuery = `SELECT tic."IDStatus", tic."ID"
						FROM public."tTicket" tic
						where "ID" in (${params['tickets[]']})`;
		db.db.any(sSQLQuery)
			.then((data) => {
				let sSQL = '';
				console.log(data);
				let errTickets = [];
				data.forEach((ticket) => {
					if (ticket.IDStatus != 3 || ticket.IDStatus != 4) errTickets.push(ticket.ID);
				})
				if ( errTickets.length == 0 ){
					let sSQL = '';
					// approve всех билетов произошел
					params['tickets[]'].forEach((item) => {
						// 4 status - резерв ( в данном случае - кассовый резерв )
						var sUpdate = `update public."tTicket" set "IDStatus" = 5
										where "ID" = ${item}
										AND "IDStatus" = 3;`;
						sSQL = sSQL + sUpdate;
					})
					db.db.any(sSQL)
						.then(() => {
							let sSQLTrans = '';
							params['tickets[]'].forEach(function(item) {

								var sTransInsert = `insert into public."tTrans" 
														( "IDTicket", "Saledate", "IDUserSaler" ) values 
														( ${item}, now(), ${sessData.cashier.ID} ); `;
								sSQLTrans = sSQLTrans + sTransInsert;
							});
							db.db.any(sSQLTrans);
							res.json({success: true})
						});
						res.json({success: true})
				}
				else {
					res.json({success: false, errTickets: errTickets});
					console.log(errTickets);
				}
			})
	})


	// получение билета
	router.get('/get/ticket/:id', function(req, res){
		//данные из сессии
		var sLogin = "";
		var nUserID = 0;
		var events = {};
		var sessData = req.session;
		if(sessData.cashier){
			sLogin = sessData.userLogin;
			nUserID = sessData.userID;
			events = sessData.eventsList;
		}
		else {
			res.redirect('/');
			//res.json({err: "no success"});
			return;
		}
		let ticketID = req.params.id;
		dbUtils.Ticket.getWithTemplate(ticketID, (ticket) => {
			templator.htmlToPdf(ticket, { name: ticket.templateName, link: `${ticket.templateUrl}/${ticket.fileName}` }, (pdfData) => {
				res.type('pdf'); 
				res.send(pdfData);
			});
		})
	})

	// получение билетов в одном pdf
	router.get('/get/tickets/:ids', function(req, res){
		//данные из сессии
		var sLogin = "";
		var nUserID = 0;
		var events = {};
		var sessData = req.session;
		if(sessData.cashier){
			sLogin = sessData.userLogin;
			nUserID = sessData.userID;
			events = sessData.eventsList;
		}
		else {
			res.redirect('/');
			//res.json({err: "no success"});
			return;
		}
		let reqTickets = req.params.ids.split(",");
		console.log(reqTickets)
		dbUtils.Ticket.getMultiWithTemplate(reqTickets /* [17132, 24370, 20903] */, (tickets) => {
			templator.multiTickets(tickets, { name: tickets[0].templateName, link: `${tickets[0].templateUrl}/${tickets[0].fileName}` }, (pdfData) => {
				res.type('pdf'); 
				res.send(pdfData);
			});
		})
	})

	router.post('/ticket/moment/reserve', function(req, res){
		//данные из сессии
		var sLogin = "";
		var nUserID = 0;
		var events = {};
		var sessData = req.session;
		if(sessData.cashier){
			sLogin = sessData.userLogin;
			nUserID = sessData.userID;
			events = sessData.eventsList;
		}
		else {
			res.redirect('/');
			//res.json({err: "no success"});
			return;
		}
		let tickID = req.body.TicketID;
		dbUtils.Ticket.getByID(tickID, (ticket) => {
			if (ticket.IDStatus == 3 ){
				dbUtils.Ticket.setStatus(tickID, 4, (data) => {
					dbUtils.Trans.insert(tickID, sessData.cashier.ID, (ans) => {
						res.json({success: true});
					})
				})
			}
			else res.json({err: "Ticket is not available!"});
		})


	})

	router.post('/ticket/moment/unreserve', function(req, res){
		//данные из сессии
		var sLogin = "";
		var nUserID = 0;
		var events = {};
		var sessData = req.session;
		if(sessData.cashier){
			sLogin = sessData.userLogin;
			nUserID = sessData.userID;
			events = sessData.eventsList;
		}
		else {
			res.redirect('/');
			//res.json({err: "no success"});
			return;
		}
		let tickID = req.body.TicketID;

		dbUtils.Ticket.getByID(tickID, (ticket) => {
			if (ticket.IDStatus == 4 ){
				dbUtils.Ticket.setStatus(tickID, 3, (data) => {
					res.json({success: true});
				})
			}
			else res.json({err: "Ticket is not reserved!"});
		})


	})
	
}