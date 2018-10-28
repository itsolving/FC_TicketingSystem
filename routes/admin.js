var express = require('express');
var router = express.Router();
var db = require('../queries');


const { Client } = require('pg');
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'qwe',
  port: 5432,
})



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
		client.connect()
		var sSQL = 'SELECT "Login" FROM public."tUser" where "isLock" = false and "IDRole" = 1 and "Login" = \''+req.body.txLogin+'\' and "Pwd" = \''+req.body.txPassword+'\'';
		console.log(sSQL);
		client.query(sSQL, (qerr, qres) => {
			console.log(qerr ? qerr.stack : qres);
			if (!qres.rowCount || qres.rowCount == 0) {
				console.log('res.rowCount='+qres.rowCount);
			}
			else {
				if (qres.rows[0] && qres.rows[0].Login) {
					console.log('qres.rows[0].Login='+qres.rows[0].Login);
					sAdminLogin = qres.rows[0].Login;
				}
				else {
					console.log('res.rows[0].Login not found');
				}
			}
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

router.get('/a', function(req, res, next) {
  res.render('adminhome', {title: 'Админка', adminLogin: 'aaa'});
});


module.exports = router;
