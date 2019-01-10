module.exports = (router, dbUtils, sAdminPageTitle) => {

	//при открытии страницы "localhost:3000/admin"
	router.get('/', function(req, res, next) {
		let sAdminLogin = "",
			sessData 	= req.session;


		console.log("GET /admin");
		if(sessData.adminLogin){
			sAdminLogin = sessData.adminLogin;
		}
		res.render('adminhome', {title: sAdminPageTitle, adminLogin: sAdminLogin, errorMsg: ""});
	});

}