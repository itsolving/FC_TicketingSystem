/*
из-за сжатых сроков пришлось пренебречь хорошими манерами программирования
имею ввиду, что не хорошо (не одобряю) использовать открытые sql-запросы прямо в коде интерфейса
*/

var express = require('express');
var router = express.Router();
var db = require('../queries');
var passwordHash = require('password-hash');



//-------------------
//для админки использую "свой" коннект к БД. Потому что запарился с общим коннектом из файла "queries.js"
/*const { Client } = require('pg');
const conOptions = {
	user: 'postgres', //local test on home-computer
	//user: 'pgadmin', //test on dev-server
	
	password: 'qwe', //local test on home-computer
	//password: 'UrdodON9zu83BvtI6L', //test on dev-server
	
	host: 'localhost',
	database: 'postgres',
	port: 5432,
};*/
//-------------------
var conn = require('./conn');
var Client = conn.connClient;
var conOptions = conn.conOptions;


//при открытии страницы "localhost:3000/admin"
router.get('/', function(req, res, next) {
	console.log("GET /admin");
	var sAdminLogin = "";
	var sessData = req.session;
	if(sessData.adminLogin){
		sAdminLogin = sessData.adminLogin;
	}
	res.render('adminhome', {title: 'Админка', adminLogin: sAdminLogin, errorMsg: ""});
});

//при нажатии кнопки на странице "localhost:3000/admin"
router.post('/', function(req, res, next) {
	console.log('POST /admin');
	var sAdminLogin = "";
	var sessData = req.session;
	if(sessData.adminLogin){
		sAdminLogin = sessData.adminLogin;
		console.log('showing adminhome with session data...');
		res.render('adminhome', {title: 'Админка', adminLogin: sAdminLogin, errorMsg: ""});
	}
	else {
		const client = new Client(conOptions);

		//console.log('client.connect...');
		client.connect()
		
		var hashedPassword = passwordHash.generate(req.body.txPassword);
		var sSQL = 'SELECT "Login", "Pwd" FROM public."tUser" where "isLock" = false and "IDRole" = 1 and "Login" = \''+req.body.txLogin+'\'';
		console.log(sSQL);
		client.query(sSQL, (qerr, qres) => {
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
			client.end();
			console.log('save sAdminLogin to session and show adminhome...');
			sessData.adminLogin = sAdminLogin;
			res.render('adminhome', {title: 'Админка', adminLogin: sAdminLogin, errorMsg: errMsg});
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
	const client = new Client(conOptions);
	var events = {};
	//console.log('client.connect...');
	client.connect()
	var sSQL = 'SELECT ev."ID", ev."Name", ev."ImgPath", ev."IDStatus", TO_CHAR(ev."DateFrom", \'DD-MM-YYYY HH24:MI:SS\') as "DateFrom", '+
				'TO_CHAR(ev."Dateto", \'DD-MM-YYYY HH24:MI:SS\') as "Dateto", ev."IDUserCreator", ev."CreateDate", ev."IDStadium", '+
				'sd."Name" as "Stadium" '+
				'FROM public."tEvent" ev '+
				'join public."tStadium" sd on ev."IDStadium" = sd."ID" '+
				'where ev."IDStatus" = 1 /*and ev."Dateto" >= now()*/ ';
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
				}
				else {
					events = qres.rows;
				}
			}
		}
		client.end();
		//res.render('adminevents', {title: 'Админка', adminLogin: sAdminLogin, eventsList: JSON.stringify(events)});
		res.render('adminevents', {title: 'Админка', adminLogin: sAdminLogin, eventsList: events});
	});
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
	var rowEventData = {};
	var stadiumList = {};
	const client = new Client(conOptions);
	//console.log('client.connect...');
	client.connect();
	var sSQL = 'SELECT ev."ID", ev."Name", ev."ImgPath", ev."IDStatus", replace(TO_CHAR(ev."DateFrom", \'YYYY-MM-DD HH24:MI\'), \' \', \'T\') as "DateFrom", '+
				'replace(TO_CHAR(ev."Dateto", \'YYYY-MM-DD HH24:MI\'), \' \', \'T\') as "Dateto", ev."IDUserCreator", ev."CreateDate", ev."IDStadium", '+
				'sd."Name" as "Stadium" '+
				'FROM public."tEvent" ev '+
				'join public."tStadium" sd on ev."IDStadium" = sd."ID" '+
				'where ev."IDStatus" = 1 /*and ev."Dateto" >= now()*/ and ev."ID" = '+nID;
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
				}
				else {
					rowEventData = qres.rows;
				}
			}
		}
		client.end();
		
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
			var sSQLSectors = 'SELECT distinct s."SectorName" from public."tSeat" s where s."IDStadium" = '+ qres.rows[0].IDStadium +' ';
			console.log(sSQLSectors);
			clientSectors.query(sSQLSectors, (qerrSectors, qresSectors) => {
				if (qerrSectors) {
					console.log("qerrSectors:");
					console.log(qerrSectors ? qerrSectors.stack : qresSectors);
				}
				else {
					//console.log(qerrSectors ? qerrSectors.stack : qresSectors);
					
					if (typeof qresSectors.rowCount === 'undefined') {
						console.log('res.rowCount not found');
					}
					else {
						if (qresSectors.rowCount == 0) {
							console.log('res.rowCount='+qresSectors.rowCount);
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
				var sSQLRows = 'SELECT distinct s."SectorName", s."RowN" from public."tSeat" s where s."IDStadium" = '+ qres.rows[0].IDStadium +' ';
				console.log(sSQLRows);
				clientRows.query(sSQLRows, (qerrRow, qresRows) => {
					if (qerrRow) {
						console.log("qerrRow:");
						console.log(qerrRow ? qerrRow.stack : qresRows);
					}
					else {
						//console.log(qerrRow ? qerrRow.stack : qresRows);
						
						if (typeof qresRows.rowCount === 'undefined') {
							console.log('res.rowCount not found');
						}
						else {
							if (qresRows.rowCount == 0) {
								console.log('res.rowCount='+qresRows.rowCount);
							}
							else {
								rowList = qresRows.rows;
							}
						}
					}
					clientRows.end();
					
					res.render('admineventedit', {title: 'Админка', adminLogin: sAdminLogin, eventData: rowEventData, eventID: nID, stadiums: stadiumList, sectors: sectorList, rownums: rowList});
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
	//var nID = req.params.id;
	var nID = req.body.id;
	var sEventName = req.body.eventName;
	
	var rowEventData = {};
	var stadiumList = {};
	const client = new Client(conOptions);
	client.connect();
	res.send('функция сохранения находится в разработке. Скоро будет готова');
	
	//пока не готово
	var sSQL = 'update public."tEvent" set "name"='+sEventName+' '+
				'where "ID" = '+nID;
	console.log(sSQL);
	/*client.query(sSQL, (qerr, qres) => {
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
				}
				else {
					rowEventData = qres.rows;
				}
			}
		}
		client.end();
		res.render('admineventedit', {title: 'Админка', adminLogin: sAdminLogin, eventData: rowEventData, eventID: nID, stadiums: stadiumList});
	});*/
});


//это нужно для jquery чтобы проставить значения в выпадающий список поля "стадионы"
router.get('/stadiumsJson', function(req, res, next) {
	console.log("GET /admin/stadiumsjson");
	var stadiumList = {};
	const client = new Client(conOptions);
	//console.log('client.connect...');
	client.connect();
	var sSQL = 'SELECT sd."ID", sd."Name" from public."tStadium" sd ';
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
				}
				else {
					stadiumList = qres.rows;
				}
			}
		}
		client.end();
		res.json(stadiumList);
	});
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
	const client = new Client(conOptions);
	var stadiums = {};
	client.connect()
	var sSQL = 'SELECT sd."ID", sd."Name", sd."IDStatus", '+
				'sd."IDUserCreator", sd."CreateDate", sd."IDCity", '+
				'ct."Name" as "CityName", \'\' as "ImgPath" '+
				'FROM public."tStadium" sd '+
				'join public."tCity" ct on ct."ID" = sd."IDCity" '+
				'where sd."IDStatus" = 1 ';
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
				}
				else {
					stadiums = qres.rows;
				}
			}
		}
		client.end();
		//res.render('adminstadiums', {title: 'Админка', adminLogin: sAdminLogin, stadiumsList: JSON.stringify(stadiums)});
		res.render('adminstadiums', {title: 'Админка', adminLogin: sAdminLogin, stadiumsList: stadiums});
	});
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
	var rowStadiumData = {};
	var cityList = {};
	const client = new Client(conOptions);
	//console.log('client.connect...');
	client.connect();
	var sSQL = 'SELECT sd."ID", sd."Name", \'\' as "ImgPath", sd."IDStatus", '+
				'sd."IDUserCreator", sd."CreateDate", sd."IDCity", '+
				'ct."Name" as "CityName" '+
				'FROM public."tStadium" sd '+
				'join public."tCity" ct on ct."ID" = sd."IDCity" '+
				'where sd."IDStatus" = 1 and sd."ID" = '+nID;
	console.log(sSQL);
	client.query(sSQL, (qerr, qres) => {
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
					rowStadiumData = qres.rows;
				}
			}
		}
		client.end();
		const clientCity = new Client(conOptions);
		//console.log('client.connect...');
		clientCity.connect();
		var sSQLCity = 'SELECT ct."ID", ct."Name" from public."tCity" ct ';
		console.log(sSQLCity);
		clientCity.query(sSQLCity, (qerrCity, qresCity) => {
			if (qerrCity) {
				console.log(qerrCity ? qerrCity.stack : qresCity);
			}
			else {
				//console.log(qerrCity ? qerrCity.stack : qresCity);
				
				if (typeof qresCity.rowCount === 'undefined') {
					console.log('res.rowCount not found');
				}
				else {
					if (qresCity.rowCount == 0) {
						console.log('res.rowCount='+qresCity.rowCount);
					}
					else {
						cityList = qresCity.rows;
					}
				}
			}
			clientCity.end();
			res.render('adminstadiumedit', {title: 'Админка', adminLogin: sAdminLogin, stadiumData: rowStadiumData, stadiumID: nID, cities: cityList});
		});
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
		res.render('admineventedit', {title: 'Админка', adminLogin: sAdminLogin, eventData: rowEventData, eventID: nID, stadiums: stadiumList});
	});*/
});

//для загрузки списка городов для отображения в выпадающем списке на вебстранице (вызываем в jquery)
router.get('/citiesJson', function(req, res, next) {
	console.log("GET /admin/citiesjson");
	var cityList = {};
	const client = new Client(conOptions);
	//console.log('client.connect...');
	client.connect();
	var sSQL = 'SELECT ct."ID", ct."Name" from public."tCity" ct ';
	console.log(sSQL);
	client.query(sSQL, (qerr, qres) => {
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
					cityList = qres.rows;
				}
			}
		}
		client.end();
		res.json(cityList);
	});
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
	const client = new Client(conOptions);
	var users = {};
	console.log('client.connect...');
	client.connect()
	var sSQL = 'SELECT u."ID", u."Login", u."Pwd", u."IDRole", u."isLock", u."Email", r."Name" as "RoleName" '+
				'FROM public."tUser" u '+
				'join public."tRole" r on r."ID" = u."IDRole" ' +
				'where u."isLock" = false ';
	console.log(sSQL);
	client.query(sSQL, (qerr, qres) => {
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
					users = qres.rows;
				}
			}
		}
		client.end();
		res.render('adminusers', {title: 'Админка', adminLogin: sAdminLogin, usersList: users});
	});
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
	var rowUserData = {};
	var rolesList = {};
	const client = new Client(conOptions);
	//console.log('client.connect...');
	client.connect();
	var sSQL = 'SELECT u."ID", u."Login", u."Pwd", u."IDRole", u."isLock", u."Email", r."Name" as "RoleName" '+
				'FROM public."tUser" u '+
				'join public."tRole" r on r."ID" = u."IDRole" ' +
				'where u."isLock" = false and u."ID" = '+nID;
	console.log(sSQL);
	client.query(sSQL, (qerr, qres) => {
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
					rowUserData = qres.rows;
				}
			}
		}
		client.end();
		
		const clientRoles = new Client(conOptions);
		clientRoles.connect();
		var sSQLRoles = 'SELECT r."ID", r."Name" from public."tRole" r ';
		console.log(sSQLRoles);
		clientRoles.query(sSQLRoles, (qerrRoles, qresRoles) => {
			if (qerrRoles) {
				console.log(qerrRoles ? qerrRoles.stack : qresRoles);
			}
			else {
				//console.log(qerrRoles ? qerrRoles.stack : qresRoles);
				
				if (typeof qresRoles.rowCount === 'undefined') {
					console.log('res.rowCount not found');
				}
				else {
					if (qresRoles.rowCount == 0) {
						console.log('res.rowCount='+qresRoles.rowCount);
					}
					else {
						rolesList = qresRoles.rows;
					}
				}
			}
			clientRoles.end();
			res.render('adminuseredit', {title: 'Админка', adminLogin: sAdminLogin, userData: rowUserData, userID: nID, roles: rolesList});
		});
	});
});

//для загрузки списка городов для отображения в выпадающем списке на вебстранице (вызываем в jquery)
router.get('/rolesJson', function(req, res, next) {
	console.log("GET /rolesjson");
	var roleList = {};
	const client = new Client(conOptions);
	//console.log('client.connect...');
	client.connect();
	var sSQL = 'SELECT r."ID", r."Name" from public."tRole" r ';
	console.log(sSQL);
	client.query(sSQL, (qerr, qres) => {
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
					roleList = qres.rows;
				}
			}
		}
		client.end();
		res.json(roleList);
	});
});



module.exports = router;


