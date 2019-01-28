let apikey = require("apikeygen").apikey,
	fs 	   = require("fs");

module.exports = (router, dbUtils, APIKEY) => {
	router.get('/docs', function(req, res) {
		let sAdminLogin = "",
			sessData 	= req.session;


		console.log("GET /api/docs");
		if ( sessData.userLogin ){
			res.render('docsAPI');
		}
		else res.redirect('/cashier');
	})
	router.get('/get/apikey/new', function(req, res){
		let sAdminLogin = "",
			sessData 	= req.session;


		console.log("GET /api/apikey/new");
		if ( sessData.api ){			
			let data = {
				APIKEY: apikey(),
				userID: sessData.api.ID
			}
			dbUtils.API.getByUserID(data.userID, (ans) => {
				console.log("ANSSSSSS HEREEEEEEEEEEEE!!!!!!!!!!!!!!!!!!!")
				console.log(ans)
				if ( ans.length > 0 ){
					res.json({err: "APIKEY already created!"})
				}
				else {
					dbUtils.API.insert(data, (ans) => {
						if ( ans.length > 0 ){
							res.json({APIKEY: data.APIKEY})
						}
					})
				}
			})

		}
		else {
			res.json({err: "no success"})
		}
	})
	router.get('/get/apikey', function(req, res){
		let sAdminLogin = "",
			sessData 	= req.session;

		console.log("GET /api/get/apikey");
		if ( sessData.api ){
			
			dbUtils.API.getByUserID(sessData.api.ID, (ans) => {
				if ( ans.length > 0 ){
					res.json({APIKEY: ans[0].APIKey})
				}
				else res.json({err: "no success"})
			})
			
		}
		else {
			res.json({err: "no success"})
		}
	})
}