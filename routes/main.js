var express = require('express');
var router = express.Router();
var db = require('../queries');

/* GET home page. */
router.get('/', function(req, res, next){
	var sLogin = "";
	var sessData = req.session;
	if(sessData.userLogin){
		sLogin = sessData.userLogin;
	}
	var events = {};
	//var events = db.getList(req, res, next);
	res.render('index', {title: 'Учет билетов', userLogin: sLogin, eventsList: events});
})

router.post('/', function(req, res, next){
	var sLogin = "";
	var events = {};
	var sSQL = "";
	var sessData = req.session;
	if(sessData.userLogin){
		sLogin = sessData.userLogin;
	}
	else {
		sSQL = 'SELECT "Login" FROM public."tUser" where "isLock" = false and "IDRole" = 2 and "Login" = \''+req.body.txLogin+'\' and "Pwd" = \''+req.body.txPassword+'\'';
		console.log(sSQL);
		db.db.any(sSQL)
			.then(function(data){
				/*res.status(200)
				.json({
					status: 'success',
					data: data,
					message: 'Retrieved list'
				});*/
				sLogin = data.rows[0].Login;
			})
			.catch(function(err){
				//return next(err);
				console.log('error of search user:');
				console.log(err);
			});
	}
	sSQL = 'SELECT "ID", "Name" FROM public."tEvent"';
	console.log(sSQL);
	db.db.any(sSQL)
		.then(function(data){
			/*res.status(200)
			.json({
				status: 'success',
				data: data,
				message: 'Retrieved list'
			});*/
			events = data;
		})
		.catch(function(err){
			//return next(err);
			console.log('error of search actual events:');
			console.log(err);
		});
	res.render('index', {title: 'Учет билетов', userLogin: sLogin, eventsList: JSON.stringify(events)});
})

router.get('/api/events', db.getList);
router.put('/api/events/:id', db.Edit);


module.exports = router;
