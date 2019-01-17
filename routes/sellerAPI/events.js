module.exports = (router, dbUtils) => {

	// отдает все мероприятия, которые открыты для API
	router.get('/:APIKEY/get/events', function(req, res){
		let params = {
			APIKEY: req.params.APIKEY,
			eventID: req.params.eventID
		}
		dbUtils.API.findByKey(params.APIKEY, (success) => {
			if ( success ){
				// true - означает, что запрос от api
				dbUtils.Event.getAll((events) => {
					if ( events.length > 0 ){
						res.json(events);
					}
					else {
						res.json({err: "no API success"});
					}
				}, true)
			}
			else res.json({err: "no success"});
		})
	})


	// получение информации о мероприятии по ID
	router.get('/:APIKEY/get/event/:eventID', function(req, res){
		let params = {
			APIKEY: req.params.APIKEY,
			eventID: req.params.eventID
		}
		dbUtils.API.findByKey(params.APIKEY, (success) => {
			if ( success ){
				// true - означает, что запрос от api
				dbUtils.Event.getById(params.eventID, (events) => {
					if ( events.length > 0 ){
						res.json(events[0]);
					}
					else {
						res.json({err: "no API success"});
					}
				}, true)
			}
			else res.json({err: "no success"});
		})
	})
}