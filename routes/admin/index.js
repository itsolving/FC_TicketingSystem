module.exports = (router, dbUtils, sAdminPageTitle) => {

	//при открытии страницы "localhost:3000/admin"
	router.get('/', function(req, res, next) {
		let sAdminLogin = "",
			sessData 	= req.session;


		console.log("GET /admin");
		if(sessData.admControl){
	        res.redirect('/admin/events/');
        }
		else {
			res.redirect('/login');
		}
	});

}