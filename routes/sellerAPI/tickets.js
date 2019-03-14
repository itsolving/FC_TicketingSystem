/* --------------------- СТАТУСЫ БИЛЕТОВ --------------------- */
/*

   ID | Name	   | Description
---------------------------------------------------------------
	1 |	Активный   |		
---------------------------------------------------------------
	2 |	Неактивный | Закрылся, приостановлена
---------------------------------------------------------------
	3 |	Свободный  | Билет продается
---------------------------------------------------------------
	4 |	Резерв	   |
---------------------------------------------------------------
	5 |	Продан	   |
---------------------------------------------------------------
	6 |	Удален	   | Билет удален 
---------------------------------------------------------------
	7 |	Заведен	   |
---------------------------------------------------------------
 */
/* ----------------------------------------------------------- */

let md5 = require('md5');



module.exports = (router, dbUtils) => {

	// получение информации о билете по ID
	router.get('/:APIKEY/get/ticket/:ticketID', function(req, res){
		let params = {
			APIKEY: req.params.APIKEY,
			ticketID: req.params.ticketID
		}
		dbUtils.API.findByKey(params.APIKEY, (success) => {
			if ( success ){
				dbUtils.Ticket.getByID(params.ticketID, (ticket) => {
					res.json(ticket);
				})
			}
			else res.json({err: "no success"});
		})
	})

	// получение списка билетов по ID мероприятия
	router.get('/:APIKEY/get/tickets/event/:eventID', function(req, res){
		let params = {
			APIKEY: req.params.APIKEY,
			eventID: req.params.eventID
		}
		dbUtils.API.findByKey(params.APIKEY, (success) => {
			if ( success ){
				dbUtils.Ticket.getByEventID(params.eventID, (tickets) => {
					res.json(tickets);
				})
			}
			else res.json({err: "no success"});
		})
	})

	// Резерв билета
	router.get('/:APIKEY/tickets/reserve/:ticketID', function(req, res){
		let params = {
			APIKEY: req.params.APIKEY,
			ticketID: req.params.ticketID
		}
		dbUtils.API.findByKey(params.APIKEY, (data) => {
			if ( data.success ){
				//res.json(params);
				dbUtils.Ticket.getByID(params.ticketID, (ticket) => {
					if ( ticket.IDStatus != 3 ){
						res.json({err: "ticket is not available"})
					}
					else {
						dbUtils.Ticket.setStatus(params.ticketID, 4, (ans) => {
							if ( ans ){
								dbUtils.Trans.insert(params.ticketID, data.userData.IDUser, (ans) => {
									res.json({success: true, data: `reserve ticket (ID:${params.ticketID}) success`})
								})
								
							}
						})
					}
				})
			}
			else res.json({err: "no success"});
		})
	})

	// Резерв билета
	router.get('/:APIKEY/tickets/unreserve/:ticketID', function(req, res){
		let params = {
			APIKEY: req.params.APIKEY,
			ticketID: req.params.ticketID
		}
		dbUtils.API.findByKey(params.APIKEY, (success) => {
			if ( success ){
				//res.json(params);
				dbUtils.Ticket.getByID(params.ticketID, (ticket) => {
					if ( ticket.IDStatus != 4 ){
						res.json({err: "ticket is not reserved"})
					}
					else {
						dbUtils.Ticket.setStatus(params.ticketID, 3, (ans) => {
							if ( ans ){
								res.json({success: true, data: `unreserve ticket (ID:${params.ticketID}) success`})
							}
						})
					}
				})
			}
			else res.json({err: "no success"});
		})
	})

	// Покупка билета
	router.get('/:APIKEY/tickets/buy/:ticketID', function(req, res){
		let params = {
			APIKEY: req.params.APIKEY,
			ticketID: req.params.ticketID
		}
		dbUtils.API.findByKey(params.APIKEY, (data) => {
			if ( data.success ){
				//res.json(params);
				dbUtils.Ticket.getByID(params.ticketID, (ticket) => {
					console.log(ticket)
					if ( ticket.IDStatus == 3 || ticket.IDStatus  == 4 ){
						// 5 IDStatus - продан
						dbUtils.Ticket.setStatus(params.ticketID, 5, (ans) => {
							if ( ans ){
								dbUtils.Trans.insert(params.ticketID, data.userData.IDUser, (trans) => {
									dbUtils.Event.ChangeEventTickets(ticket.IDEvent, 1, (back) => {
										let hash = md5((ticket.ID + ticket.IDEvent + ticket.Barcode))
										res.json({
											success: true, 
											IDTicket: ticket.ID,
											data: `sale ticket (ID:${params.ticketID}) success`, 
											ticketCloud: `/cloud/ticket/${ticket.ID}/${hash}`
										});
									})
									 
								})
							}
						})
						
					}
					else {	
						res.json({err: "ticket is not available"})
					}
				})
			}
			else res.json({err: "no success"});
		})
	})

	
}