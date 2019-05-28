let passwordHash = require('password-hash');

module.exports = (router, dbUtils, sAdminPageTitle) => {


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