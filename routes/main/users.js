let passwordHash = require('password-hash');

module.exports = (router, db) => {
	//выход из сессии
	router.get('/exit', function(req, res){
		req.session.destroy(function(err) {
			if(err){throw err;}
		});
		res.redirect('/');
	});
	// страница авторизации
	router.get('/login', function(req, res){
		console.log("get: /login");
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

	// авторизация
	router.post('/login', function(req, res){
		console.log('post: /login');
		var sLogin = "";
		var nUserID = 0;
		var events = {};
		var sSQL = "";
		var sessData = req.session;
		var hashedPassword = passwordHash.generate(req.body.txPassword);
		console.log('req.body.txPassword='+req.body.txPassword+', hashedPassword = '+hashedPassword);
		sSQL = 'SELECT "ID", "Login", "Pwd" FROM public."tUser" where "isLock" = false and "IDRole" in (2,3,4) and "Login" = \''+req.body.txLogin+'\'';
		console.log(sSQL);
		db.db.any(sSQL)
			.then(function(data){
				console.log('data[0].Login='+data[0].Login+', data[0].Pwd='+data[0].Pwd);
				if (passwordHash.verify(req.body.txPassword, data[0].Pwd)) {
					console.log('user found:');
					console.log(data);
					sLogin = data[0].Login;
					nUserID = data[0].ID;
					sessData.userLogin = data[0].Login;
					sessData.userID = data[0].ID;
					console.log('sLogin='+sLogin);

					sSQL = 'SELECT "ID", "Name", "ImgPath", "DateFrom" FROM public."tEvent" where "IDStatus" = 1';
					console.log(sSQL);
					db.db.any(sSQL)
						.then(function(data){
							console.log('events found:');
							console.log(data);
							events = data;
							sessData.eventsList = data;
							console.log('events: '+ JSON.stringify(events));

							console.log('rendering page...');
							console.log('sLogin='+sLogin);
							res.redirect('/events');
						})
						.catch(function(err){
							//return next(err);
							console.log('error of search actual events:');
							console.log(err);
						});
				}
				else {
					sessData.errorMsg = "Неправильный пароль кассира.";
					res.redirect('/login');
				}
			})
			.catch(function(err){
				//return next(err);
				console.log('error of search user:');
				console.log(err);
				sessData.errorMsg = "Неправильный логин кассира.";
				res.redirect('/login');
			});
	})

}
