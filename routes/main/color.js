module.exports = (router, db) => {
	router.get('/colors/get/byevent/:IDEvent', function(req, res){
		let data = {
			IDEvent: req.params.IDEvent
		}

		dbUtils.PriceColor.getByEvent(data.IDEvent, (results) => {
			if ( results.length > 0 ){
				res.json(results);
			}
			else {
				res.json({err: "colors not found"});
			}
		})

	})

	router.get('/colors/get/byid/:ID', function(req, res){
		let data = {
			ID: req.params.ID
		}

		dbUtils.PriceColor.getByID(data.ID, (color) => {
			if ( color.ID ){
				res.json(color);
			}
			else {
				res.json({err: `color by (ID: ${data.ID}) not found`});
			}
		})

	})

	router.get('/colors/get/custom/:IDEvent/:Price', function(req, res){
		let data = {
			IDEvent: req.params.IDEvent,
			Price:   req.params.Price
		}

		dbUtils.PriceColor.getCustom(data.IDEvent, data.Price , (color) => {
			if ( color.ID ){
				res.json(color);
			}
			else {
				res.json({err: `color by (ID: ${data.ID}) not found`});
			}
		})

	})


}