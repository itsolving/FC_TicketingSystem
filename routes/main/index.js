let Templator 	 = require(`${__basedir}/helpers/Templator.js`),
templator 	 = new Templator();
module.exports = (router, dbUtils) => {
	//страница авторизации кассира
	router.get('/', function(req, res, next){
		console.log("get: /");
		var sLogin = "";
		var nUserID = 0;
		var events = {};
		var sessData = req.session;
		if ( sessData.cashier || sessData.api ){
			res.redirect('/events');
		}
		else if ( sessData.admControl ){
			res.redirect('/admin/events/')
		}
		else {
			res.redirect('/events/');
		}
	})

	// router.get('/test/test', function(req, res, next){
	// 	dbUtils.Ticket.testTest((mainTickets) => {
	// 		console.log(mainTickets)
	// 		dbUtils.Ticket.getMultiWithTemplate(mainTickets, 'A4', (tickets) => {
	// 			console.log(tickets)
	// 			templator.multiTickets(tickets, { name: tickets[0].templateName, link: `${tickets[0].templateUrl}/${tickets[0].fileName}` }, 'A4', (pdfData) => {
	// 				res.type('pdf'); 
	// 				res.send(pdfData);
	// 			});
	// 		})
	// 	})
	// })

	

}