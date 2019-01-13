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
		dbUtils.API.findByKey(params.APIKEY, (success) => {
			if ( success ){
				//res.json(params);
				dbUtils.Ticket.getByID(params.ticketID, (ticket) => {
					if ( ticket.statusID == 2 ||  ticket.statusID == 5 || ticket.statusID == 5 ){
						res.json({err: "ticket is not available"})
					}
					else {
						dbUtils.Ticket.setStatus(params.ticketID, 4, (ans) => {
							if ( ans.rowCount ){
								res.json({success: true, data: `reserver ticket (ID:${params.ticketID}) success`})
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
							if ( ans.rowCount ){
								res.json({success: true, data: `unreserve ticket (ID:${params.ticketID}) success`})
							}
						})
					}
				})
			}
			else res.json({err: "no success"});
		})
	})

	
}