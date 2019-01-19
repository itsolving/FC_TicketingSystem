let Templator 	 = require(`${__basedir}/helpers/Templator.js`),
	templator 	 = new Templator();

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


	// получение билета
	router.get('/kassa/get/ticket/:id', function(req, res){
		let ticketID = req.params.id;
		dbUtils.Ticket.getWithTemplate(ticketID, (ticket) => {
			templator.htmlToPdf(ticket, { name: ticket.templateName, link: `${ticket.templateUrl}/${ticket.fileName}` }, (pdfData) => {
				res.type('pdf'); 
				res.send(pdfData);
			});
		})
	})

}