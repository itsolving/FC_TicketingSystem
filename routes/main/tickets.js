let bwipjs    = require('bwip-js'),
	md5		  = require('md5'),
	Templator = require(`${__basedir}/helpers/Templator.js`)
	payBoxer  = require(`${__basedir}/helpers/payBox.js`),
	mailer  = require(`${__basedir}/helpers/mailer.js`),
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



	router.get('/cloud/ticket/:templateType/:ticketid/:hash', function(req, res){

		let data = {
			IDTicket: req.params.ticketid,
			hash:     req.params.hash
		}
		console.log(data);

		let templateType = req.params.templateType;
		dbUtils.Ticket.getMultiWithTemplate(data.IDTicket, templateType, (result) => {
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

	router.post('/ticket/moment/reserve', function(req, res){

		let tickID = req.body.TicketID;
		dbUtils.Ticket.getByID(tickID, (ticket) => {
			if (ticket.IDStatus == 3 && ticket.Price != 0){
				dbUtils.Ticket.setStatus(tickID, 4, (data) => {
					dbUtils.Trans.insert(tickID, 10 /* HARD */, false, (ans) => {
						res.json({success: true});
					})
				})
			}
			else res.json({err: "Ticket is not available!"});
		})


	})

	router.post('/ticket/moment/unreserve', function(req, res){
		
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

	router.post('/tickets/buy', function(req, res){
		let params = req.body;
		params = JSON.stringify(params);
		params = JSON.parse(params);
		
		let tickets = params.tickets;

		console.log(tickets);

		dbUtils.Ticket.getInfoByIDs(tickets.join(','), (data) => {
			let sum = 0;
			data.forEach((item) => {
				sum += parseInt(item.Price);
			})
			console.log(sum);
			payBoxer.createPayment({Price: sum, tickets: data}, (paymentInfo) => {
				dbUtils.Payment.insert({
					IDPayment: paymentInfo.id,
					Tickets:   tickets,
					Amount:    sum
				}, (back) => {
					dbUtils.Payment.insert({
						IDPayment: paymentInfo.id,
						Tickets:   tickets,
						Amount:    sum
					}, (back) => {
						res.json({success: true, link: paymentInfo.payment_page_url})
					})


					res.json({success: true, link: paymentInfo.payment_page_url})
				})
			})
		})
	})

	router.post('/payment/tickets/success', function(req, res){
		res.setHeader('Access-Control-Allow-Origin', '*');
		let data = req.body;
		console.log(data);
		payBoxer.getPaymentInfo(data.id, (info) => {
			info = JSON.parse(info);
			let obj = {
                status:     info.status.code,
                amount:     info.amount,
                paymentid:  info.id,
                created_at: info.created_at,
                updated_at: info.updated_at
            }
            if ( info.options.user ){
                obj.email = info.options.user.email;
                obj.phone = info.options.user.phone;
            }
            dbUtils.Payment.changeData(obj, (answer) => {
                if (info.status.code == 'success'){
                    dbUtils.Ticket.multiStatus(item.Tickets.split(','), 5, (next) => {
                        dbUtils.Ticket.customSelect(item.Tickets, (tickets) => {
                            mailer.sendUserMail({mail: info.options.user.email}, tickets, () => {
                                // payment success, tickets go to user
                                console.log(`ticketsURL | payment success (id: ${info.id})`);
                                res.json({success: true});
                            })  
                        })
                    })
                }
                else{
                	res.json({success: true})
                }
            })
		})
	})
		
}