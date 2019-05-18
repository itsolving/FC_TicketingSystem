let bwipjs    = require('bwip-js'),
	md5		  = require('md5'),
	Templator = require(`${__basedir}/helpers/Templator.js`),
	templator = new Templator();


module.exports = (router, dbUtils) => {
	
	//получение билетов по указанному мероприятию и сектору, используется в схеме зала
	router.post('/getsectortickets', function(req, res){
	//получение json-списка билетов по указанному сектору
		console.log('post /getsectortickets');
		var eventID = req.body.IDEvent;
		var sectorName = req.body.SectorName;
		console.log('eventID='+eventID);
		console.log('sectorName='+sectorName);

		if (eventID !== 'undefined') {
				
			dbUtils.Ticket.getBySectorEvent(sectorName, eventID, (data) => {
				console.log('tickets-sql finished success, eventID='+eventID+', sectorName='+sectorName);
				//console.log(data);
				if (data.length > 0) {
					console.log('tickets>0, eventID='+eventID+', sectorName='+sectorName);
					res.status(200)
						.json({
							ReqStatus: 'success',
							Message: 'tickets found',
							TicketData: data
						});
				}
				else {
					console.log('no tickets, eventID='+eventID+', sectorName='+sectorName);
					res.status(500)
						.json({
							ReqStatus: 'error',
							Message: 'tickets not found',
							TicketData: data
						});
					}
			})
		}	
	});


	// router.post('/beta/tickets/reserve/', function(req, res, next){
		// резерв обычного пользователя
		
	// })

	router.get('/get/barcode/:text', function(req, res){

		
		// format: /get/barcode/?bcid=ean13&text=123456789012
		req.query = { 
			bcid: "ean13", 
			text: req.params.text, 
			scale: 3, 
			height: 10, 
			includetext: true, 
			textxalign: 'center' 
		};

	    req.url = "?"
	    for(var attr in req.query) { 
		    req.url += `&${attr}=${req.query[attr]}`; 
		}
		console.log(req.url)

	    if (!req.query.bcid ) {
	        res.writeHead(404, { 'Content-Type':'text/plain' });
	        res.end('Unknown request format.', 'utf8');
	    } else {
	        bwipjs(req, res);
	    }
	})



	router.get('/cloud/ticket/:ticketid/:hash', function(req, res){

		let data = {
			IDTicket: req.params.ticketid,
			hash:     req.params.hash
		}
		console.log(data);
		dbUtils.Ticket.getMultiWithTemplate(data.IDTicket, (result) => {
			if ( result.length > 0 ){
				let ticket = result[0];
				let resultHash = md5((ticket.ID + ticket.IDEvent + ticket.Barcode));
				console.log(resultHash);
				if ( data.hash == resultHash ){
					templator.multiTickets([ticket], { name: ticket.templateName, link: `${ticket.templateUrl}/${ticket.fileName}` }, true /* cashier printer status */, (pdfData) => {
						res.type('pdf'); 
						res.send(pdfData);
					});
				}
				else {
					res.json({err: 'Hash error!'});
				}
			} 
			else {
				res.json({err: 'ticket not found'});
			}
		})
		
	})
		
}