let dbUtils 	 = require('./../../database/DatabaseUtils.js'),
    Templator 	 = require(`${__basedir}/helpers/Templator.js`),
	templator 	 = new Templator();

module.exports = (router, db, PageTitle) => {

	//дополнительная проверка билетов

	router.post('/beta/ticket/approve', function(req, res, next){
		console.log('post /kassa/beta/ticket/approve');
		//данные из сессии
		var sLogin = "";
		var nUserID = 0;
		var events = {};
		var sessData = req.session;
		if(sessData.userLogin){
			sLogin = sessData.userLogin;
			nUserID = sessData.userID;
			events = sessData.eventsList;
		}
		else {
			res.json({err: "no success"});
			return
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

	//вход на страницу выбранного мероприятия
	router.post('/beta/ticket/reserve/', function(req, res, next){
		//данные из сессии
		var sLogin = "";
		var nUserID = 0;
		var events = {};
		var sessData = req.session;
		if(sessData.userLogin){
			sLogin = sessData.userLogin;
			nUserID = sessData.userID;
			events = sessData.eventsList;
		}
		else {
			res.json({err: "no success"});
			return;
		}
		// нужна проверка на авторизацию кассы
		let params = req.body;
		params = JSON.stringify(params);
		params = JSON.parse(params);
		console.log(params);
		if ((typeof params['tickets[]']) == 'string' ) params['tickets[]'] = [params['tickets[]']];
		let sSQL = '';
		params['tickets[]'].forEach((item) => {
				// 4 status - резерв ( в данном случае - кассовый резерв )
				var sUpdate = `update public."tTicket" set "IDStatus" = 4
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
											( ${item}, now(), ${5} ); `;
					sSQLTrans = sSQLTrans + sTransInsert;
				});
				db.db.any(sSQLTrans);
				res.json({success: true})
			});
	})


	// получение билета
	router.get('/beta/get/ticket/:id', function(req, res){
		//данные из сессии
		var sLogin = "";
		var nUserID = 0;
		var events = {};
		var sessData = req.session;
		if(sessData.userLogin){
			sLogin = sessData.userLogin;
			nUserID = sessData.userID;
			events = sessData.eventsList;
		}
		else {
			res.json({err: "no success"});
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
	
}