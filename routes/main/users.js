let passwordHash = require('password-hash');

module.exports = (router, dbUtils) => {
	//выход из сессии
	router.get('/exit', function(req, res){
		req.session.destroy(function(err) {
			if(err){throw err;}
		});
		res.redirect('/');
	});
	// страница авторизации кассира
	router.get('/cashier', function(req, res){
		console.log("get: /cashier");
		var sLogin = "";
		var nUserID = 0;
		var events = {};
		var sMsg = "";
		var sessData = req.session;
		sMsg = sessData.errorMsg;
		if(sessData.userLogin){
			sLogin = sessData.userLogin;
			nUserID = sessData.userID;
			events = sessData.eventsList;
		}

		//var events = db.getList(req, res, next);
		res.render('index', {title: 'Учет билетов', userLogin: sLogin, userID: nUserID, eventsList: events, errorMsg: sMsg});
	})

	// авторизация	кассира
	router.post('/cashier', function(req, res){
		console.log('post: /cashier');
		var sLogin = "";
		var nUserID = 0;
		var events = {};
		var sSQL = "";
		var sessData = req.session;
		var hashedPassword = passwordHash.generate(req.body.txPassword);
		dbUtils.Users.cashierLogin(req.body.txLogin, (data) => {
				if (!data[0]) {
					sessData.errorMsg = "Неверный логин или пароль";
					res.redirect('/cashier');
					return;
				}
				console.log('data[0].Login='+data[0].Login+', data[0].Pwd='+data[0].Pwd);
				if (passwordHash.verify(req.body.txPassword, data[0].Pwd)) {
					console.log('user found:');
					console.log(data);
					sLogin = data[0].Login;
					nUserID = data[0].ID;
					sessData.userLogin = data[0].Login;
					sessData.userID = data[0].ID;
					// 2 роль - кассир
					if ( data[0].IDRole == 2 || data[0].IDRole == 6 ){
						req.session.cashier = {
							
							ID: data[0].ID,
							login: data[0].Login,
							IDRole: data[0].IDRole
						};
					}
					// 4 роль - апи для сторонних продавцов
					else if ( data[0].IDRole ==  4){
						req.session.api = {
							ID: data[0].ID,
							login: data[0].Login,
							IDRole: data[0].IDRole
						};
					}
					console.log('sLogin='+sLogin);

					dbUtils.Event.getActive((ans) =>{
						events = ans;
						sessData.eventsList = ans;
						res.redirect('/events');
					})
				}
				else {
					sessData.errorMsg = "Неверный логин или пароль";
					res.redirect('/cashier');
				}
		})
	})

}
