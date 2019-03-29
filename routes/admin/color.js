module.exports = (router, dbUtils) => {
	
	router.post('/colors/new/', function(req, res){
		let sAdminLogin = "",
			sessData 	= req.session;

		if(sessData.admControl){
	        sAdminLogin = sessData.admControl.Login;
        }
		else {
			res.redirect('/admin');
			return;
		}

		let data = {
			IDEvent: req.body.IDEvent,
			Price:   req.body.Price,
			Color:   req.body.Color
		}

		dbUtils.PriceColor.getCustom(data.IDEvent, data.Price , (color) => {
			if ( color.ID ){
				res.json({err: `Color by this params (${data}) already exist`})
			}
			else {
				// создаем 
				dbUtils.PriceColor.insert(data, (ans) => {
					if ( ans.ID ) res.json({success: true})
					else res.json({err: "Fail color create"})
				})
			}
		})

	})

	router.post('/colors/modify/', function(req, res){
		let sAdminLogin = "",
			sessData 	= req.session;

		if(sessData.admControl){
	        sAdminLogin = sessData.admControl.Login;
        }
		else {
			res.redirect('/admin');
			return;
		}

		let params = req.body;
		params = JSON.stringify(params);
		params = JSON.parse(params);
		
		params.items = JSON.parse(params.items);
		console.log(params);

		params.items.forEach((item) => {
			console.log(item)
			dbUtils.PriceColor.getCustom(params.IDEvent, item.price, (color) => {
				console.log(color);
				if ( color ){
					dbUtils.PriceColor.setCustom(params.IDEvent, item.price, item.color, (ans) => {
						console.log(`Color by this params (IDEvent: ${params.IDEvent}, data: ${item}) updated`);
					})
				}
				else {
					// создаем 
					dbUtils.PriceColor.insert({IDEvent: params.IDEvent, Color: item.color, Price: item.price }, (ans) => {
						console.log(`Color by this params (IDEvent: ${params.IDEvent}, data: ${item}) created`)
					})
				}
			})
		})

	})

	router.post('/colors/update/byid/', function(req, res){
		let sAdminLogin = "",
			sessData 	= req.session;

		if(sessData.admControl){
	        sAdminLogin = sessData.admControl.Login;
        }
		else {
			res.redirect('/admin');
			return;
		}

		let data = {
			ID: req.body.ID,
			Price:   req.body.Price,
			Color:   req.body.Color
		}

		dbUtils.PriceColor.setByID(data.ID, data.Price, data.Color , (color) => {
			res.json({success: true, data: `Color by this params (${data}) updated`})
		})

	})

	router.post('/colors/update/custom/', function(req, res){
		let sAdminLogin = "",
			sessData 	= req.session;

		if(sessData.admControl){
	        sAdminLogin = sessData.admControl.Login;
        }
		else {
			res.redirect('/admin');
			return;
		}

		let data = {
			IDEvent: req.body.IDEvent,
			Price:   req.body.Price,
			Color:   req.body.Color
		}

		dbUtils.PriceColor.setCustom(data.IDEvent, data.Price, data.Color , (color) => {
			res.json({success: true, data: `Color by this params (${data}) updated`})
		})

	})

}