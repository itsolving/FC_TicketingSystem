let dbUtils 	 = require('./../../database/DatabaseUtils.js'),
    Templator 	 = require(`${__basedir}/helpers/Templator.js`),
    mailer 	     = require(`${__basedir}/helpers/mailer.js`),
	templator 	 = new Templator(),
	md5 		 = require('md5');

module.exports = (router, PageTitle, dbUtils) => {

	// покупка билетов
	router.post('/tickets/buy/', function(req, res, next){
		//данные из сессии
		let sLogin   = "",
		 	nUserID  = 0,
		 	events   = {},
		 	sessData = req.session;

		if(sessData.cashier){
			sLogin = sessData.userLogin;
			nUserID = sessData.userID;
			events = sessData.eventsList;
		}
		else {
			res.redirect('/');
			return;
		}
		let params = req.body;
		params = JSON.stringify(params);
		params = JSON.parse(params);
		
		let tickets = params.tickets;

		console.log(tickets);
		
		dbUtils.Ticket.customSelect(tickets, (data) => {
			console.log(data)
			let sSQL = '';
			let errTickets = [];
			data.forEach((ticket) => {
				if (ticket.IDStatus != 3 && ticket.IDStatus != 4) errTickets.push(ticket.ID);
				else if (ticket.Price == 0){
					if (sessData.cashier.IDRole != 6 ) errTickets.push(ticket.ID)
				}
			})
			if ( errTickets.length == 0 ){
				dbUtils.Ticket.multiStatus(tickets, 5, (ans) => {
					dbUtils.Trans.multiInsert(tickets, sessData.cashier.ID, params.CartStatus, (back) => {
						if ( sessData.cashier.IDRole == 6 ){
							dbUtils.Ticket.setPriceByID({price: 0, tickets: tickets}, (result) => {
								res.json({success: true});
							})
						}
						else {
							res.json({success: true});
						}
					})
				})
			}
			else {
				res.json({success: false, errTickets: errTickets});
				console.log(errTickets);
			}
		})
	})


	// получение билета ( одного )
	router.get('/get/ticket/:templateType/:id', function(req, res){
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
		let templateType = req.params.templateType;
		dbUtils.Ticket.getWithTemplate(ticketID, templateType, (ticket) => {
			templator.htmlToPdf(ticket, { name: ticket.templateName, link: `${ticket.templateUrl}/${ticket.fileName}` }, templateType, (pdfData) => {
				res.type('pdf'); 
				res.send(pdfData);
			});
		})
	})

	// получение билетов в одном pdf
	router.get('/get/tickets/:templateType/:ids', function(req, res){
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
		let templateType = req.params.templateType;
		console.log(reqTickets)
		dbUtils.Ticket.getMultiWithTemplate(reqTickets, templateType, (tickets) => {
			templator.multiTickets(tickets, { name: tickets[0].templateName, link: `${tickets[0].templateUrl}/${tickets[0].fileName}` }, templateType, (pdfData) => {
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
			if (ticket.IDStatus == 3 && ticket.Price != 0){
				dbUtils.Ticket.setStatus(tickID, 4, (data) => {
					dbUtils.Trans.insert(tickID, sessData.cashier.ID, false, (ans) => {
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

	router.post('/tickets/send/', function(req, res){
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

		let clientData = req.body;
		console.log(clientData);
		let tickets = clientData.tickets;

		dbUtils.Ticket.customSelect(tickets, (data) => {
			console.log(data)
			let sSQL = '';
			let errTickets = [];
			data.forEach((ticket) => {
				if (ticket.IDStatus != 3 && ticket.IDStatus != 4) errTickets.push(ticket.ID);
				else if (ticket.Price == 0){
					if (sessData.cashier.IDRole != 6 ) errTickets.push(ticket.ID)
				}
			})
			if ( errTickets.length == 0 ){
				dbUtils.Ticket.multiStatus(tickets, 5, (ans) => {
					dbUtils.Trans.multiInsert(tickets, sessData.cashier.ID, false, (back) => {
						if ( sessData.cashier.IDRole == 6 ){
							dbUtils.Ticket.setPriceByID({price: 0, tickets: tickets}, (result) => {
								mailer.sendMail({mail: clientData.mail, req: req}, data, () => {
									res.json({success: true});
								})	
							})
						}
						else {
							res.json({err: "IDRole error!", success: false});
						}
					})
				})
			}
			else {
				res.json({success: false, errTickets: errTickets});
				console.log(errTickets);
			}
		})
	})


	router.get('/get/main/tickets/:templateType/:hash/:ids', function(req, res){
		let reqTickets = req.params.ids.split(",");
		console.log(reqTickets);
		let reqData = {
			hash: req.params.hash,
			tickets: reqTickets
		}

		let templateType = req.params.templateType;

		dbUtils.Ticket.getMultiWithTemplate(reqData.tickets, templateType, (tickets) => {
			// hash approve
			let firstTicket = tickets[0];
			if ( reqData.hash == md5((firstTicket.ID + firstTicket.IDEvent + firstTicket.Barcode))){
				templator.multiTickets(tickets, { name: tickets[0].templateName, link: `${tickets[0].templateUrl}/${tickets[0].fileName}` }, templateType, (pdfData) => {
					res.type('pdf'); 
					res.send(pdfData);
				});
			}
			else res.json({err: "access trouble"});
			// ------------
			
		})
	})
	
}