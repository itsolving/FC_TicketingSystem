module.exports = (router, dbUtils, sAdminPageTitle) => {
	
	//при открытии страницы "localhost:3000/admin/reports"
	router.get('/reports', function(req, res, next){
		let sAdminLogin = "",
			sessData 	= req.session;


		console.log("GET /admin/reports");
		if(sessData.adminLogin){
			sAdminLogin = sessData.adminLogin;
		}
		else {
			res.redirect('/admin');
			return;
		}

		res.render('adminReports', { title: sAdminPageTitle, adminLogin: sAdminLogin });
	})

	//при открытии страницы "localhost:3000/admin/reports/trans"
	router.get('/reports/trans', function(req, res, next) {
		let sAdminLogin = "",
			sessData 	= req.session;


		console.log("GET /admin/reports/trans");
		if(sessData.adminLogin){
			sAdminLogin = sessData.adminLogin;
		}
		else {
			res.redirect('/admin');
			return;
		}

		dbUtils.Trans.getAll((trans) => {
			res.render('adminTrans', { title: sAdminPageTitle, adminLogin: sAdminLogin, transList: trans });
		})

	});

}