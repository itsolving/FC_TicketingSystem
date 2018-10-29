var express = require('express');
var router = express.Router();
var db = require('../queries');


const { Client } = require('pg');
const conOptions = {
	user: 'postgres',
	host: 'localhost',
	database: 'postgres',
	password: 'qwe',
	port: 5432,
};


router.get('/', function(req, res, next) {
	var sAdminLogin = "";
	var sessData = req.session;
	if(sessData.adminLogin){
		sAdminLogin = sessData.adminLogin;
	}
	res.render('adminhome', {title: 'Админка', adminLogin: sAdminLogin});
});

router.post('/', function(req, res, next) {
	var sAdminLogin = "";
	var sessData = req.session;
	if(sessData.adminLogin){
		//console.log('sessData.adminLogin is defined'); //test
		sAdminLogin = sessData.adminLogin;
		console.log('showing adminhome with session data...');
		res.render('adminhome', {title: 'Админка', adminLogin: sAdminLogin});
	}
	else {
		//console.log('sessData.adminLogin is undefined'); //test
		const client = new Client(conOptions);

		console.log('client.connect...');
		client.connect()
		var sSQL = 'SELECT "Login" FROM public."tUser" where "isLock" = false and "IDRole" = 1 and "Login" = \''+req.body.txLogin+'\' and "Pwd" = \''+req.body.txPassword+'\'';
		console.log(sSQL);
		client.query(sSQL, (qerr, qres) => {
			if (qerr) {
				console.log(qerr ? qerr.stack : qres);
			}
			else {
				console.log(qerr ? qerr.stack : qres);
				
				if (typeof qres.rowCount === 'undefined') {
					console.log('res.rowCount not found');
				}
				else {
					if (qres.rowCount == 0) {
						console.log('res.rowCount='+qres.rowCount);
					}
					else {
						if (typeof qres.rows[0] === 'undefined') {
							console.log('qres.rows[0] not found');
						}
						else {
							if (typeof qres.rows[0].Login === 'undefined') {
								console.log('res.rows[0].Login not found');
							}
							else {
								console.log('qres.rows[0].Login='+qres.rows[0].Login);
								sAdminLogin = qres.rows[0].Login;
							}
						}
					}
				}
			}
			console.log('client.end...');
			client.end();
			console.log('save sAdminLogin to session and show adminhome...');
			sessData.adminLogin = sAdminLogin;
			res.render('adminhome', {title: 'Админка', adminLogin: sAdminLogin});
		});
	}
});

router.get('/exit', function(req, res){
	req.session.destroy(function(err) {
		if(err){throw err;}
	});
	res.redirect('/admin');
});

router.get('/events', function(req, res, next) {
	const client = new Client(conOptions);
	console.log('client.connect...');
	client.connect()
	var sSQL = 'SELECT "ID", "Name", "ImgPath", "IDStatus", "DateFrom", "Dateto", "IDUserCreator", "CreateDate", "IDStadium" '+
				'FROM public."tEvent" '+
				'where "IDStatus" = 1 and "Dateto" >= now() ';
	console.log(sSQL);
	client.query(sSQL, (qerr, qres) => {
		if (qerr) {
			console.log(qerr ? qerr.stack : qres);
		}
		else {
			console.log(qerr ? qerr.stack : qres);
			
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
		console.log('client.end...');
		client.end();
		res.send('adminevents', {eventsList: events});
	});
});


module.exports = router;
