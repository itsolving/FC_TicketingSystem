var express = require('express');
var router = express.Router();

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
	}
	else {
		//console.log('sessData.adminLogin is undefined'); //test
		
		
		
		
		sAdminLogin = req.body.txLogin;
		sessData.adminLogin = sAdminLogin;
	}
	res.render('adminhome', {title: 'Админка', adminLogin: sAdminLogin});
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
