let passwordHash = require('password-hash');

module.exports = (router, dbUtils) => {
	//выход из сессии
	router.get('/exit', function(req, res){
		req.session.destroy(function(err) {
			if(err){throw err;}
		});
		res.redirect('/login');
	});

	router.get('/login', function(req, res){
		console.log("get: /cashier");
		var sLogin = "";
		var nUserID = 0;
		var events = {};
		var sMsg = "";
		var sessData = req.session;
		sMsg = sessData.errorMsg;
		if ( sessData.cashier || sessData.api ){
			res.redirect('/events');
		}
		else if ( sessData.admControl ){
			res.redirect('/admin/events/');
		}
		else {
			res.render('login', {title: "Авторизация", errorMsg: ""});
		}
		
	})

	router.post('/login', function(req, res){
		console.log('post: /login');
		var sLogin = "";
		var nUserID = 0;
		var events = {};
		var sSQL = "";
		var sessData = req.session;
		var hashedPassword = passwordHash.generate(req.body.txPassword);
		dbUtils.Users.login({login: req.body.txLogin}, (data) => {
				if (!data) {
					sessData.errorMsg = "Неверный логин или пароль";
					res.redirect('/login');
					return;
				}
				console.log('data.Login='+data.Login+', data.Pwd='+data.Pwd);
				if (passwordHash.verify(req.body.txPassword, data.Pwd)) {
					console.log('user found:');
					console.log(data);
					sLogin = data.Login;
					nUserID = data.ID;
					sessData.userLogin = data.Login;
					sessData.userID = data.ID;

					// 2 роль - кассир, 6 - главный кассир
					if ( data.IDRole == 2 || data.IDRole == 6 ){
						req.session.cashier = {
							ID: data.ID,
							login: data.Login,
							IDRole: data.IDRole
						};
						
						res.redirect('/events');
					}
					// 4 роль - апи для сторонних продавцов
					else if ( data.IDRole ==  4){
						req.session.api = {
							ID: data.ID,
							login: data.Login,
							IDRole: data.IDRole
						};
						res.redirect('/events');
					}

					// 1 роль - админ
					else if ( data.IDRole == 1 ){
						sessData.admControl = {
							ID: data.ID,
							Login: data.Login,
							IDRole: data.IDRole
						};
						res.redirect('/admin/events');
					}
					console.log('sLogin='+sLogin);

				}
				else {
					sessData.errorMsg = "Неверный логин или пароль";
					res.redirect('/login');
				}
		})
	})

}
