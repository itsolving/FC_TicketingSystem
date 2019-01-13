let apikey = require("apikeygen").apikey;

module.exports = (router, dbUtils, APIKEY) => {
	router.get('/get/apikey/new', function(req, res){
		let sAdminLogin = "",
			sessData 	= req.session;


		console.log("GET /api/get/apikey");
		if ( sessData.admControl ){
			dbUtils.Users.getByID(sessData.userID, (users) => {
				let user = users[0];
				if ( user ){
					// IDRole = 4  ---- API
					if ( user.IDRole == 4 ){
						// generate API KEY
						let data = {
							APIKEY: apikey(),
							userID: user.ID
						}
						dbUtils.API.getByUserID(data.userID, (ans) => {
							if ( ans != [] ){
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
					else res.json({err: "no success"})
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
		if ( sessData.admControl ){
			dbUtils.Users.getByID(sessData.userID, (users) => {
				let user = users[0];
				// IDRole = 4  ---- API
				if ( user.IDRole == 4 ){
					// generate API KEY
					dbUtils.API.getByUserID(user.ID, (ans) => {
						if ( ans.length > 0 ){
							res.json({APIKEY: ans[0].APIKEY})
						}
						else res.json({err: "no success"})
					})
				}
				else res.json({err: "no success"})
			})
		}
		else {
			res.json({err: "no success"})
		}
	})
}