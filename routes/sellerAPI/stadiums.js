module.exports = (router, dbUtils) => {

	// отдает все мероприятия, которые открыты для API
	router.get('/:APIKEY/get/stadiums', function(req, res){
		let params = {
			APIKEY: req.params.APIKEY
		}
		dbUtils.API.findByKey(params.APIKEY, (success) => {
			if ( success ){
				// true - означает, что запрос от api
				dbUtils.Stadium.getNameID((stadiums) => {
					if ( stadiums.length > 0 ){
						res.json(stadiums);
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