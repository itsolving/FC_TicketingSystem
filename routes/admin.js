/*
из-за сжатых сроков пришлось пренебречь хорошими манерами программирования
имею ввиду, что не хорошо (не одобряю) использовать открытые sql-запросы прямо в коде интерфейса
*/

var express = require('express');
var router = express.Router();
var db = require('./queries');
var passwordHash = require('password-hash');
var formidable = require('formidable');
var fs = require('fs');
var qr = require('qr-image');

const multer = require('multer')
const upload = multer({ storage: multer.memoryStorage() })

var conn = require('./conn');
var Client = conn.connClient;
var conOptions = conn.conOptions;

const sAdminPageTitle = 'Управление билетной системой';

let dbUtils = require('./../database/DatabaseUtils.js');		// Управление бд



//при открытии страницы "localhost:3000/admin"
router.get('/', function(req, res, next) {
	console.log("GET /admin");
	var sAdminLogin = "";
	var sessData = req.session;
	if(sessData.adminLogin){
		sAdminLogin = sessData.adminLogin;
	}
	res.render('adminhome', {title: sAdminPageTitle, adminLogin: sAdminLogin, errorMsg: ""});
});

//при нажатии кнопки на странице "localhost:3000/admin"
router.post('/', function(req, res, next) {
	console.log('POST /admin');
	var sAdminLogin = "";
	var sessData = req.session;
	if(sessData.adminLogin){
		sAdminLogin = sessData.adminLogin;
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

			var errMsg = "";
			if (qerr) {
				console.log('qerr:');
				console.log(qerr ? qerr.stack : qres);
				errMsg = "Ошибка подключения. Попробуйте позже.";
			}
			else {
				//console.log(qerr ? qerr.stack : qres);
				
				if (typeof qres.rowCount === 'undefined') {
					console.log('res.rowCount not found');
					errMsg = "Ошибка А1: неверный логин, либо пользователь заблокирован";
				}
				else {
					if (qres.rowCount == 0) {
						console.log('res.rowCount='+qres.rowCount);
						errMsg = "Ошибка А2: неверный логин, либо пользователь заблокирован";
					}
					else {
						if (typeof qres.rows[0] === 'undefined') {
							console.log('qres.rows[0] not found');
							errMsg = "Ошибка А3: неверный логин, либо пользователь заблокирован";
						}
						else {
							if (typeof qres.rows[0].Login === 'undefined') {
								console.log('res.rows[0].Login not found');
								errMsg = "Ошибка А4: неверный логин, либо пользователь заблокирован";
							}
							else {
								//console.log('qres.rows[0].Login='+qres.rows[0].Login+', qres.rows[0].Pwd='+qres.rows[0].Pwd);
								if (passwordHash.verify(req.body.txPassword, qres.rows[0].Pwd)) {
									console.log('qres.rows[0].Login='+qres.rows[0].Login);
									sAdminLogin = qres.rows[0].Login;
									errMsg = "";
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
			console.log('save sAdminLogin to session and show adminhome...');
			sessData.adminLogin = sAdminLogin;
			res.render('adminhome', {title: sAdminPageTitle, adminLogin: sAdminLogin, errorMsg: errMsg});
		});
	}
});


//когда нажимают ссылку "Выйти" надо очистить сессию
router.get('/exit', function(req, res){
	console.log("GET /admin/exit");
	req.session.destroy(function(err) {
		if(err){throw err;}
	});
	res.redirect('/admin');
});



//открытие страницы "localhost:3000/admin/events", отображение списка мероприятий
router.get('/events', function(req, res, next) {
	console.log("GET /admin/events");
	var sAdminLogin = "";
	var sessData = req.session;
	if(sessData.adminLogin){
		sAdminLogin = sessData.adminLogin;
	}
	else {
		res.redirect('/admin');
		return;
	}

	dbUtils.Event.getAll((events) => {
		res.render('adminevents', {title: sAdminPageTitle, adminLogin: sAdminLogin, eventsList: events});
	})
});

router.post('/events', function(req, res, next) {
	console.log("POST /admin/events");
	var sAdminLogin = "";
	var sessData = req.session;
	if(sessData.adminLogin){
		sAdminLogin = sessData.adminLogin;
	}
	else {
		res.redirect('/admin');
		return;
	}
	var postOperation = req.body.postOperation;
	dbUtils.Event.insert(postOperation, (ans) => {
		res.send(ans);
	})
});


//открытие страницы редактирования одного мероприятия "localhost:3000/admin/event/123", где 123 это идентификатор мероприятия
router.get('/event/:id', function(req, res, next) {
	console.log("GET /admin/event/id");
	var sAdminLogin = "";
	var sessData = req.session;
	if(sessData.adminLogin){
		sAdminLogin = sessData.adminLogin;
	}
	else {
		res.redirect('/admin');
		return;
	}
	var nID = req.params.id;
	var stadiumList = {};

	dbUtils.Event.getById(nID, (rowEventData, qres) => {
		dbUtils.Stadium.getNameID((stadiumList) => {
			var nIDStadiumEvent = 0;
			if (typeof qres.rowCount !== 'undefined') {
				if (qres.rowCount > 0) {
					if(qres.rows[0].IDStadium !== 'undefined'){
						nIDStadiumEvent = qres.rows[0].IDStadium;
					}
				}
			}
			dbUtils.Seat.customSelect(nID, nIDStadiumEvent, (sectorList) => {

				console.log(sectorList)
				console.log("nIDStadiumEvent =" + nIDStadiumEvent)
				dbUtils.Seat.getByStadiumID(nID, nIDStadiumEvent, (rowList) => {
					//console.log(rowList);
					let mainPrices = Object;
					sectorList.forEach((item, i, array) => {
						mainPrices[item.SectorName] = [];
					})
					rowList.forEach((item, i, array) => {
						sectorList.forEach((sector, i, array) => {
							if ( sector.SectorName == item.SectorName ){
								mainPrices[sector.SectorName].push({
									RowN: item.RowN,
									Price: item.Price
								});
							}
						})
					})
					//console.log(mainPrices);
					res.render('admineventedit', {title: sAdminPageTitle, adminLogin: sAdminLogin, eventData: rowEventData, eventID: nID, stadiums: stadiumList, sectors: sectorList, rownums: mainPrices});
				});
			});
		});
		
	});
});

//сохранение изменений мероприятия
router.post('/event/:id', function(req, res, next) {
	console.log("POST /admin/event/id");
	var sAdminLogin = "";
	var sessData = req.session;
	if(sessData.adminLogin){
		sAdminLogin = sessData.adminLogin;
	}
	else {
		res.redirect('/admin');
		return;
	}
	
	if(!req.body){
		console.log("req.body is null. Redirect to event/id...");
		res.send('req.body is null');
		return;
	}

	let eventData = {
		nID: 			req.params.id,
		sPostOperation: req.body.postOperation,
		sEventName: 	req.body.eventName,
		sImgPath: 		req.body.eventAfisha,
		sDateFrom: 		req.body.eventDateFrom,
		nStadiumID: 	req.body.stadiumID,
		bshowOnline: 	req.body.showOnline,
		bshowCasher: 	req.body.showCasher,
		bshowAPI: 		req.body.showAPI
	};

	dbUtils.Event.update(eventData, (sResMsg) => {
		res.send(sResMsg);
	})
	// код в database/EventsUtils.js -> update ( разработка )
});

//картинки для афиши мероприятий отображаются только вот так:
router.get('/images/events/:imgname', function(req, res, next){
	var sImgName = req.params.imgname;
	//res.send(__dirname + '../../images/events/' + sImgName);
	res.send(sImgName);
});

//загрузка файла с картинкой афиши мероприятия (лишь копируем файл в спецпапку на сервере, но не сохраняем путь в БД)
router.post('/uploadeventimg', function(req, res, next){
	var form = new formidable.IncomingForm();
    form.parse(req);
    form.on('fileBegin', function (name, file){
        file.path = __dirname + '/../public/images/events/' + file.name;
		sFilename = file.name;
    });
    form.on('file', function (name, file){
        console.log('Uploaded ' + file.name);
		res.send(file.name);
		return;
    });
	form.on('error', function(err) {
		console.error(err);
		return res.send('error: '+err);
	});
    res.status(200);
});


//сохранение в БД назначенных цен по указанным секторам в рамках выбранного мероприятия
router.post('/updateprices', function(req, res, next){
	var sAdminLogin = "";
	var sessData = req.session;
	if(sessData.adminLogin){
		sAdminLogin = sessData.adminLogin;
	}
	else {
		res.redirect('/admin');
		return;
	}
	
	if(!req.body){
		console.log("req.body is null. Redirect to event/id...");
		res.send('req.body is null');
		return;
	}
	
	//запомним параметры
	var nEventID = req.body.eventId; //"eventId": 1
	var sectors = req.body.sectors; //"sector": [ {"name": "N1", "price": 10}, {"name": "W7", "price": 25} ]
	
	dbUtils.Ticket.updatePrice(nEventID, sectors, (ans) => {
		console.log(ans)
		if ( ans == "OK" ){
			res.json({"ok": "OK"});
		}
		else {
			res.json({"ok": ans});
		}
	})
});


router.get('/eventGetStatus/:id', function(req, res, next){
	var nID = req.params.id;

	dbUtils.Event.getStatus(nID, (rowEventData) => {
		res.json(rowEventData);
	})
	
});

//это нужно для jquery чтобы проставить значения в выпадающий список поля "стадионы"
router.get('/stadiumsJson', function(req, res, next) {
	console.log("GET /admin/stadiumsjson");

	dbUtils.Stadium.getNameID((stadiumList) => {
		res.json(stadiumList);
	})
	
});

//открытие страницы со списком стадионов
router.get('/stadiums', function(req, res, next) {
	console.log("GET /admin/stadiums");
	var sAdminLogin = "";
	var sessData = req.session;
	if(sessData.adminLogin){
		sAdminLogin = sessData.adminLogin;
	}
	else {
		res.redirect('/admin');
		return;
	}
	dbUtils.Stadium.getAll((stadiums) => {
		res.render('adminstadiums', {title: sAdminPageTitle, adminLogin: sAdminLogin, stadiumsList: stadiums});
	})
	
});

//если зашли на адрес "localhost:3000/admin/stadium/123" где 123 это идентификатор стадиона
router.get('/stadium/:id', function(req, res, next) {
	console.log("GET /admin/stradium/id");
	var sAdminLogin = "";
	var sessData = req.session;
	if(sessData.adminLogin){
		sAdminLogin = sessData.adminLogin;
	}
	else {
		res.redirect('/admin');
		return;
	}
	var nID = req.params.id;
	dbUtils.Stadium.getByID(nID, (rowStadiumData) => {

		dbUtils.City.getNameID((cityList => {
			res.render('adminstadiumedit', {title: sAdminPageTitle, adminLogin: sAdminLogin, stadiumData: rowStadiumData, stadiumID: nID, cities: cityList});
		}))
		
	});
});

//сохранение изменений по стадиону
router.post('/stadium/:id', function(req, res, next) {
	console.log("POST /admin/stadium/id");
	var sAdminLogin = "";
	var sessData = req.session;
	if(sessData.adminLogin){
		sAdminLogin = sessData.adminLogin;
	}
	else {
		res.redirect('/admin');
		return;
	}
	var nID = req.body.id;
	var rowStadiumData = {};
	var cityList = {};
	const client = new Client(conOptions);
	client.connect();
	
	res.send('функция сохранения находится в разработке. Скоро будет готова');
	
	//пока не готово
	var sSQL = 'update public."tStadium" set ...'+
				'where sd."ID" = '+nID;
	console.log(sSQL);
	/*client.query(sSQL, (qerr, qres) => {
		if (qerr) {
			console.log(qerr ? qerr.stack : qres);
		}
		else {
			//console.log(qerr ? qerr.stack : qres);
			
			if (typeof qres.rowCount === 'undefined') {
				console.log('res.rowCount not found');
			}
			else {
				if (qres.rowCount == 0) {
					console.log('res.rowCount='+qres.rowCount);
				}
				else {
					rowEventData = qres.rows;
				}
			}
		}
		client.end();
		res.render('admineventedit', {title: sAdminPageTitle, adminLogin: sAdminLogin, eventData: rowEventData, eventID: nID, stadiums: stadiumList});
	});*/
});

//для загрузки списка городов для отображения в выпадающем списке на вебстранице (вызываем в jquery)
router.get('/citiesJson', function(req, res, next) {
	console.log("GET /admin/citiesjson");
	dbUtils.City.getNameID((cityList) => {
		res.json(cityList);
	})
});




//открытие страницы со списком пользователей
router.get('/users', function(req, res, next) {
	console.log("GET /users");
	var sAdminLogin = "";
	var sessData = req.session;
	if(sessData.adminLogin){
		sAdminLogin = sessData.adminLogin;
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
	console.log("POST /admin/users");
	var sAdminLogin = "";
	var sessData = req.session;
	if(sessData.adminLogin){
		sAdminLogin = sessData.adminLogin;
	}
	else {
		res.redirect('/admin');
		return;
	}
	var postOperation = req.body.postOperation;
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
	if(sessData.adminLogin){
		sAdminLogin = sessData.adminLogin;
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
	if(sessData.adminLogin){
		sAdminLogin = sessData.adminLogin;
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
		sPwd:			req.body.userPwd,
		nIDRole: 		req.body.roleID,
		bIsLock: 		req.body.userIsLock,
		sEmail: 		req.body.userEmail
	};
	

	dbUtils.Users.updateStatus(userData, (sResMsg) => {
		res.send(sResMsg);
	})
});


//для загрузки списка городов для отображения в выпадающем списке на вебстранице (вызываем в jquery)
router.get('/rolesJson', function(req, res, next) {
	console.log("GET /rolesjson");
	dbUtils.Role.getNameID((roleList) => {
		res.json(roleList);
	})
	
});

//при открытии страницы "localhost:3000/admin/reports"

router.get('/reports', function(req, res, next){
	console.log("GET /admin/reports");
	var sAdminLogin = "";
	var sessData = req.session;
	if(sessData.adminLogin){
		sAdminLogin = sessData.adminLogin;
	}
	else {
		res.redirect('/admin');
		return;
	}

	res.render('adminReports', {title: sAdminPageTitle, adminLogin: sAdminLogin});
})

//при открытии страницы "localhost:3000/admin/reports/trans"
router.get('/reports/trans', function(req, res, next) {
	console.log("GET /admin/reports/trans");
	var sAdminLogin = "";
	var sessData = req.session;
	if(sessData.adminLogin){
		sAdminLogin = sessData.adminLogin;
	}
	else {
		res.redirect('/admin');
		return;
	}

	dbUtils.Trans.getAll((trans) => {
		res.render('adminTrans', {title: sAdminPageTitle, adminLogin: sAdminLogin, transList: trans});
	})

});

//при открытии страницы "localhost:3000/admin/abonements"

router.get('/abonements', function(req, res, next){
	console.log("GET /admin/reports");
	var sAdminLogin = "";
	var sessData = req.session;
	if(sessData.adminLogin){
		sAdminLogin = sessData.adminLogin;
	}
	else {
		res.redirect('/admin');
		return;
	}

	dbUtils.Abonement.getAll((abonements) => {
		res.render('adminAbonements', {title: sAdminPageTitle, adminLogin: sAdminLogin, abonList: abonements});
	})

})

//при открытии страницы "localhost:3000/admin/reports/add"

router.get('/abonements/add', function(req, res, next){
	console.log("GET /admin/reports");
	var sAdminLogin = "";
	var sessData = req.session;
	if(sessData.adminLogin){
		sAdminLogin = sessData.adminLogin;
	}
	else {
		res.redirect('/admin');
		return;
	}

	dbUtils.Event.getNameId((events) => { 
		res.render('adminAbonementsAdd', {title: sAdminPageTitle, adminLogin: sAdminLogin, evensList: events}); 
	})


})

//создание абонемента

router.post('/abonements/add', function(req, res, next){
	console.log("GET /admin/reports");
	var sAdminLogin = "";
	var sessData = req.session;
	if(sessData.adminLogin){
		sAdminLogin = sessData.adminLogin;
	}
	else {
		res.redirect('/admin');
		return;
	}

	var formData = req.body;

	var seatData = {
		seatID: null,
		SectorName: (formData.tribune + formData.sector).toUpperCase(),
		RowN: formData.row,
		SeatN: formData.seat
	};

	dbUtils.Seat.getByPosition(seatData, (data) => {

		var itemData = {
			Price: formData.price,
			SectorName: data.SectorName,
			SeatID: data.seatID,
			RowN: data.RowN,
			SeatN: data.SeatN,
			evensIDs: null
		};
		console.log(typeof(formData.evens))
		if ( typeof(formData.evens) == 'string' ) itemData.evensIDs = formData.evens;
		else itemData.evensIDs = formData.evens.join()

		console.log(itemData);

		dbUtils.Abonement.insert(itemData, () => { res.redirect('/admin/abonements/add'); })

	});

	

})

// изменение прайса на билетах ( NEW BETA )

router.post('/ticket/changeprice/', function(req, res){
	console.log("GET /admin/reports");
	var sAdminLogin = "";
	var sessData = req.session;
	if(sessData.adminLogin){
		sAdminLogin = sessData.adminLogin;
	}
	else {
		res.redirect('/admin');
		return;
	}

	let data = {
		nEventID: 		req.body.nEventID,
		newPrice: 		req.body.newPrice,
		rowN: 			req.body.rowN,
		sector: 		req.body.sector
	};
	console.log(data);

	dbUtils.Ticket.updatePrice(data.nEventID, [{name: data.sector, price: data.newPrice, RowN: data.rowN}], (ans) => {
		console.log(ans);
	})
})

// страница /admin/templates

router.get('/templates', function(req, res){
	console.log("GET /admin/templates");

	var sAdminLogin = "";
	var sessData = req.session;
	if(sessData.adminLogin){
		sAdminLogin = sessData.adminLogin;
	}
	else {
		res.redirect('/admin');
		return;
	}

	dbUtils.Template.getAll((templates) => {
		res.render('adminTemplates', {title: sAdminPageTitle, adminLogin: sAdminLogin, templates: templates});
	})

})

// создание и загрузка нового шаблона

let fileUploader = require('./../helpers/fileUploader.js');

router.post('/templates', function(req, res){
	console.log("POST /admin/templates");

	var sAdminLogin = "";
	var sessData = req.session;
	if(sessData.adminLogin){
		sAdminLogin = sessData.adminLogin;
	}
	else {
		res.redirect('/admin');
		return;
	}

	var filesURL = `/../templates/${req.body.name}`;
	fileUploader(req.files, filesURL);
	dbUtils.Template.insert({templateName: req.body.name,fileURL: filesURL}, (ans) => {
		res.redirect('/admin/templates');
	})

})

router.get('/template/:id', function(req, res){
	console.log("GET /admin/templates");

	var nID = req.params.id;

	var sAdminLogin = "";
	var sessData = req.session;
	if(sessData.adminLogin){
		sAdminLogin = sessData.adminLogin;
	}
	else {
		res.redirect('/admin');
		return;
	}

	// разработка

	res.json({templateID: nID});
})


//testing variant Kuanysh Tuktubayev 2019-01-06
router.get('/qr/:text', function(req,res){
   var code = qr.image(req.params.text, { type: 'png', ec_level: 'H', size: 10, margin: 0 });
   res.setHeader('Content-type', 'image/png');
   code.pipe(res);
})



module.exports = router;
