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

	/*var rowEventData = {};
	const client = new Client(conOptions);
	client.connect();
	var sSQL = 'SELECT ev."ID", ev."Name", ev."ImgPath", ev."IDStatus", '+
				'replace(TO_CHAR(ev."DateFrom", \'YYYY-MM-DD HH24:MI\'), \' \', \'T\') as "DateFrom", '+
				'replace(TO_CHAR(ev."Dateto", \'YYYY-MM-DD HH24:MI\'), \' \', \'T\') as "Dateto", ev."IDUserCreator", ev."CreateDate", ev."IDStadium", '+
				'sd."Name" as "Stadium", s."Name" as "StatusName", '+
				'ev."ShowOnline", ev."ShowCasher", ev."ShowAPI" ' +
				'FROM public."tEvent" ev '+
				'join public."tStadium" sd on ev."IDStadium" = sd."ID" '+
				'left join public."tStatus" s on s."ID" = ev."IDStatus" ' +
				'where ev."IDStatus" = 1  and ev."ID" = '+nID;
	console.log(sSQL);
	client.query(sSQL, (qerr, qres) => {
		if (qerr) {
			console.log("qerr:");
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
					rowEventData = qres.rows;
				}
				else {
					rowEventData = qres.rows;
				}
			}
		}
		client.end();*/

		
		const clientStadiums = new Client(conOptions);
		clientStadiums.connect();
		var sSQLStadiums = 'SELECT sd."ID", sd."Name" from public."tStadium" sd ';
		console.log(sSQLStadiums);
		clientStadiums.query(sSQLStadiums, (qerrStadium, qresStadium) => {
			if (qerrStadium) {
				console.log("qerrStadium:");
				console.log(qerrStadium ? qerrStadium.stack : qresStadium);
			}
			else {
				//console.log(qerrStadium ? qerrStadium.stack : qresStadium);
				
				if (typeof qresStadium.rowCount === 'undefined') {
					console.log('res.rowCount not found');
				}
				else {
					if (qresStadium.rowCount == 0) {
						console.log('res.rowCount='+qresStadium.rowCount);
						stadiumList = qresStadium.rows;
					}
					else {
						stadiumList = qresStadium.rows;
					}
				}
			}
			clientStadiums.end();
			
			var sectorList = {};
			const clientSectors = new Client(conOptions);
			clientSectors.connect();
			var nIDStadiumEvent = 0;
			if (typeof qres.rowCount !== 'undefined') {
				if (qres.rowCount > 0) {
					if(qres.rows[0].IDStadium !== 'undefined'){
						nIDStadiumEvent = qres.rows[0].IDStadium;
					}
				}
			}
			var sSQLSectors = 'SELECT distinct s."SectorName", (select max(t."Price") from public."tTicket" t where t."IDEvent" = '+nID
							+' and t."IDSeat" = s."ID") "Price" from public."tSeat" s where s."IDStadium" = '+ nIDStadiumEvent +' ';
			console.log(sSQLSectors);
			clientSectors.query(sSQLSectors, (qerrSectors, qresSectors) => {
				if (qerrSectors) {
					console.log("qerrSectors:");
					console.log(qerrSectors ? qerrSectors.stack : qresSectors);
				}
				else {
					//console.log(qerrSectors ? qerrSectors.stack : qresSectors);
					
					if (typeof qresSectors.rowCount === 'undefined') {
						console.log('sectorList res.rowCount not found');
					}
					else {
						if (qresSectors.rowCount == 0) {
							console.log('sectorList res.rowCount='+qresSectors.rowCount);
							sectorList = qresSectors.rows;
						}
						else {
							sectorList = qresSectors.rows;
						}
					}
				}
				clientSectors.end();
				
				var rowList = {};
				const clientRows = new Client(conOptions);
				clientRows.connect();
				var nIDStadiumEvent = 0;
				if (typeof qres.rowCount === 'undefined') {
					if (qres.rowCount > 0) {
						if(qres.rows[0].IDStadium === 'undefined'){
							nIDStadiumEvent = 0;
						}
						else {
							nIDStadiumEvent = qres.rows[0].IDStadium;
						}
					}
				}
				else {nIDStadiumEvent = 0;}
				var sSQLRows = 'SELECT distinct s."SectorName", s."RowN" from public."tSeat" s where s."IDStadium" = '+ nIDStadiumEvent +' ';
				console.log(sSQLRows);
				clientRows.query(sSQLRows, (qerrRow, qresRows) => {
					if (qerrRow) {
						console.log("qerrRow:");
						console.log(qerrRow ? qerrRow.stack : qresRows);
					}
					else {
						//console.log(qerrRow ? qerrRow.stack : qresRows);
						
						if (typeof qresRows.rowCount === 'undefined') {
							console.log('rowList res.rowCount not found');
						}
						else {
							if (qresRows.rowCount == 0) {
								console.log('rowList res.rowCount='+qresRows.rowCount);
								rowList = qresRows.rows;
							}
							else {
								rowList = qresRows.rows;
							}
						}
					}
					clientRows.end();
					
					res.render('admineventedit', {title: sAdminPageTitle, adminLogin: sAdminLogin, eventData: rowEventData, eventID: nID, stadiums: stadiumList, sectors: sectorList, rownums: rowList});
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
	
	var nID = req.params.id;
	var sPostOperation = req.body.postOperation;
	var sLogin = req.body.userLogin;
	//var sPwd = req.body.userPwd;
	var nIDRole = req.body.roleID;
	var bIsLock = req.body.userIsLock;
	var sEmail = req.body.userEmail;
	
	//var hashedPassword = passwordHash.generate(sPwd);	
	/*if (passwordHash.verify(req.body.txPassword, qres.rows[0].Pwd)) {
		console.log('qres.rows[0].Login='+qres.rows[0].Login);
		sAdminLogin = qres.rows[0].Login;
		errMsg = "";
	}
	else {
		console.log('wrong password');
		errMsg = "Ошибка: неправильный пароль администратора";
	}*/
	
	const client = new Client(conOptions);
	client.connect();
	//res.send('функция находится в разработке. Скоро будет готова');
	var sSQL = "";
	if (sPostOperation == "del") {
		//нет поля IDStatus, мы лишь блокируем юзера, поэтому функции удаления не будет
		sSQL = 'update public."tUser" set "IDStatus"=6 '+
				'where "ID" = '+nID;
	} else {
		sSQL = 'update public."tUser" set "Login"=\''+sLogin+'\', '+
				'"IDRole"='+nIDRole+', "isLock"='+bIsLock+', "Email" = \''+sEmail+'\' '+
				'where "ID" = '+nID;
	}
	console.log(sSQL);
	client.query(sSQL, (qerr, qres) => {
		var sResMsg = "";
		if (sPostOperation == "del") {
			sResMsg = "Удалил";
		}
		else {
			sResMsg = "Сохранил";
		}
		if (qerr) {
			console.log("qerr:");
			console.log(qerr ? qerr.stack : qres);
			sResMsg = "Ошибка выполнения: "+qerr;
		}
		client.end();
		res.send(sResMsg);
	});
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



module.exports = router;
