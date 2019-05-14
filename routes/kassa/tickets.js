let dbUtils 	 = require('./../../database/DatabaseUtils.js'),
    Templator 	 = require(`${__basedir}/helpers/Templator.js`),
    mailer 	     = require(`${__basedir}/helpers/mailer.js`),
	templator 	 = new Templator();

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
		// нужна проверка на авторизацию кассы
		let params = req.body;
		params = JSON.stringify(params);
		params = JSON.parse(params);
		//console.log(params)

	
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
					
						dbUtils.Trans.multiInsert(tickets, sessData.cashier.ID, (back) => {

							if ( sessData.cashier.IDRole == 6 ){
								dbUtils.Ticket.setPriceByID({price: 0, tickets: tickets}, (result) => {
									res.json({success: true});
								})
							}
							else {
								res.json({success: true});
							}
							
							// dbUtils.Event.ChangeEventTickets(data[0].IDEvent, tickets.length, (next) => {
							// 	res.json({success: true});
							// })
						})
					
					
				})
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
			if (ticket.IDStatus == 3 && ticket.Price != 0){
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

	router.post('/tickets/send/', function(req, res){
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
	
}