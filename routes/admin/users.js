let passwordHash = require('password-hash');

module.exports = (router, dbUtils, sAdminPageTitle) => {

	//при нажатии кнопки на странице "localhost:3000/admin"
	router.post('/', function(req, res, next) {
		let sAdminLogin = "",
			sessData 	= req.session;


		console.log('POST /admin');
		if(sessData.admControl){
			sAdminLogin = sessData.admControl.Login;
			console.log('showing adminhome with session data...');
			res.render('adminhome', {title: sAdminPageTitle, adminLogin: sAdminLogin, errorMsg: ""});
		}
		else {
			let clientData = {
				login: req.body.txLogin,
				password: passwordHash.generate(req.body.txPassword)
			};

			// основная логика авторизации осталась здесь, sql запрос вынес
			dbUtils.Users.getByLogin(clientData, (qerr, qres) =>{

				let errMsg = "";
				if (qerr) {
					console.log('qerr:');
					console.log(qerr ? qerr.stack : qres);
					errMsg = "Ошибка подключения. Попробуйте позже.";
				}
				else {
					//console.log(qerr ? qerr.stack : qres);
					
					if (typeof qres.rowCount === 'undefined') {
						console.log('res.rowCount not found');
						errMsg = "Неверный логин, либо пользователь заблокирован";
					}
					else {
						if (qres.rowCount == 0) {
							console.log('res.rowCount='+qres.rowCount);
							errMsg = "Неверный логин, либо пользователь заблокирован.";
						}
						else {
							if (typeof qres.rows[0] === 'undefined') {
								console.log('qres.rows[0] not found');
								errMsg = "Неверный логин, либо пользователь заблокирован!";
							}
							else {
								if (typeof qres.rows[0].Login === 'undefined') {
									console.log('res.rows[0].Login not found');
									errMsg = "неверный логин, либо пользователь заблокирован";
								}
								else {
									//console.log('qres.rows[0].Login='+qres.rows[0].Login+', qres.rows[0].Pwd='+qres.rows[0].Pwd);
									if (passwordHash.verify(req.body.txPassword, qres.rows[0].Pwd)) {
										console.log('qres.rows[0].Login='+qres.rows[0].Login);
										sAdminLogin = qres.rows[0].Login;
										errMsg = "";
										console.log('save '+sAdminLogin+' to session and show adminhome...');
										//sessData.Login = sAdminLogin;
										sessData.admControl = {
											ID: qres.rows[0].ID,
											Login: qres.rows[0].Login,
											IDRole: qres.rows[0].IDRole
										};
										//console.log(sessData.admControl)
										res.redirect('/admin/events');
										return;
									}
									else {
										console.log('wrong password');
										errMsg = "Ошибка: неправильный пароль администратора";
									}
								}
							}
						}
					}
				}
				
				
				res.render('adminhome', {title: sAdminPageTitle, adminLogin: sAdminLogin, errorMsg: errMsg});
			});
		}
	});


	//когда нажимают ссылку "Выйти" надо очистить сессию
	router.get('/exit', function(req, res){
		console.log("GET /admin/exit");

		req.session.destroy(function(err) {
			if(err) console.log(err);
		});

		res.redirect('/admin');
	});


	//открытие страницы со списком пользователей
	router.get('/users', function(req, res, next) {
		let sAdminLogin = "",
			sessData 	= req.session;


		console.log("GET /users");
		if(sessData.admControl){
			sAdminLogin = sessData.admControl.Login;
		}
		else {
			res.redirect('/admin');
			return;
		}
		console.log('client.connect...');

		dbUtils.Users.getAll((users) => {
			res.render('adminusers', {title: sAdminPageTitle, adminLogin: sAdminLogin, usersList: users});
		})
		
	});

	router.post('/users', function(req, res, next) {
		let sAdminLogin = "",
			sessData 	= req.session;


		console.log("POST /admin/users");
		if(sessData.admControl){
			sAdminLogin = sessData.admControl.Login;
		}
		else {
			res.redirect('/admin');
			return;
		}
		let postOperation = req.body.postOperation;
		
		let UserData = {
			login: "newuser",
			password: passwordHash.generate("12345678"),
			email: "",
			isLock: false,
			IDRole: 2
		};
		dbUtils.Users.insert(UserData, postOperation, (ans) => {
			res.send(ans);
		})
	});


	//если зашли на адрес "localhost:3000/admin/user/123" где 123 это идентификатор пользователя
	router.get('/user/:id', function(req, res, next) {
		console.log("GET /user/id");
		var sAdminLogin = "";
		var sessData = req.session;
		if(sessData.admControl){
			sAdminLogin = sessData.admControl.Login;
		}
		else {
			res.redirect('/admin');
			return;
		}
		var nID = req.params.id;
		var rolesList = {};
		dbUtils.Users.getByID(nID, (rowUserData) => {

			dbUtils.Role.getNameID((rolesList) => {
				res.render('adminuseredit', {title: sAdminPageTitle, adminLogin: sAdminLogin, userData: rowUserData, userID: nID, roles: rolesList});
			})
			
		});
	});

	//сохранение пользователя
	router.post('/user/:id', function(req, res, next) {
		console.log("POST /admin/user/id");
		var sAdminLogin = "";
		var sessData = req.session;
		if(sessData.admControl){
	        sAdminLogin = sessData.admControl.Login;
        }
		else {
			res.redirect('/admin');
			return;
		}
		
		if(!req.body){
			console.log("req.body is null. Redirect to /admin/user/id...");
			res.send('req.body is null');
			return;
		}

		let userData = {
			nID: 			req.params.id,
			sPostOperation: req.body.postOperation,
			sLogin: 		req.body.userLogin,
			sPwd:			passwordHash.generate(req.body.userPwd),
			nIDRole: 		req.body.roleID,
			bIsLock: 		req.body.userIsLock,
			sEmail: 		req.body.userEmail
		};
		

		dbUtils.Users.updateStatus(userData, (sResMsg) => {
			res.send(sResMsg);
		})
	});

}