module.exports = (router, dbUtils, APIKEY) => {
	router.get('/:APIKEY/get/ticket/:ticketID', function(req, res){
		let params = {
			APIKEY: req.params.APIKEY,
			ticketID: req.params.ticketID
		}
		if ( params.APIKEY == APIKEY ){
			dbUtils.Ticket.getByID(params.ticketID, (ticket) => {
				res.json(ticket);
			})
		}
		else {
			res.json({err: "no success"})
		}
	})

	router.get('/:APIKEY/get/tickets/event/:eventID', function(req, res){
		let params = {
			APIKEY: req.params.APIKEY,
			eventID: req.params.eventID
		}
		if ( params.APIKEY == APIKEY ){
			dbUtils.Ticket.getByEventID(params.eventID, (tickets) => {
				res.json(tickets);
			})
		}
		else {
			res.json({err: "no success"})
		}
	})
}