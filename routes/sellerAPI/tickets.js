/* --------------------- СТАТУСЫ БИЛЕТОВ --------------------- */
/*

   ID | Name	   | Description
---------------------------------------------------------------
	1 |	Активный   |		
---------------------------------------------------------------
	2 |	Неактивный | Закрылся, приостановлена д...
---------------------------------------------------------------
	3 |	Свободный  | Билет продается, но пока не...
---------------------------------------------------------------
	4 |	Резерв	   |
---------------------------------------------------------------
	5 |	Продан	   |
---------------------------------------------------------------
	6 |	Удален	   | Билет удален (возможно был ...
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

	// Резерв билета ** разработка **
	router.get('/:APIKEY/tickets/reserve/:ticketID', function(req, res){
		let params = {
			APIKEY: req.params.APIKEY,
			ticketID: req.params.ticketID
		}
		dbUtils.API.findByKey(params.APIKEY, (success) => {
			if ( success ){
				res.json(params);
			}
			else res.json({err: "no success"});
		})
	})

	
}