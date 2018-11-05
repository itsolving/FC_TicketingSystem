var express = require('express');
var router = express.Router();
var db = require('../queries');


/* GET home page. */
router.get('/', function(req, res, next){
	var sLogin = "";
	var events = {};
	var sessData = req.session;
	if(sessData.userLogin){
		sLogin = sessData.userLogin;
		events = sessData.eventsList;
	}
	
	//var events = db.getList(req, res, next);
	res.render('index', {title: 'Учет билетов', userLogin: sLogin, eventsList: events});
})


router.get('/events', function(req, res, next){
	res.redirect('/');
})

router.post('/events', function(req, res, next){
	var sLogin = "";
	var events = {};
	var sSQL = "";
	var sessData = req.session;
	if(sessData.userLogin){
		sLogin = sessData.userLogin;
		
		console.log('sLogin='+sLogin);
		
		sSQL = 'SELECT "ID", "Name", "ImgPath", "DateFrom" FROM public."tEvent" where "IDStatus" = 1 union all SELECT "ID", "Name", "ImgPath", "DateFrom" FROM public."tEvent" where "IDStatus" = 1 union all SELECT "ID", "Name", "ImgPath", "DateFrom" FROM public."tEvent" where "IDStatus" = 1';
		console.log(sSQL);
		db.db.any(sSQL)
			.then(function(data){
				/*res.status(200)
				.json({
					status: 'success',
					data: data,
					message: 'Retrieved list'
				});*/
				console.log('events found:');
				console.log(data);
				sessData.eventsList = data;
				events = data;
				console.log('events: '+ JSON.stringify(events));
				
				console.log('rendering page...');
				console.log('sLogin='+sLogin);
				console.log('events: '+ JSON.stringify(events));
				//res.render('events', {title: 'Учет билетов', userLogin: sLogin, eventsList: JSON.stringify(events)});
				res.render('events', {title: 'Учет билетов', userLogin: sLogin, eventsList: events});
			})
			.catch(function(err){
				//return next(err);
				console.log('error of search actual events:');
				console.log(err);
			});
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
				console.log('user found:');
				console.log(data);
				sLogin = data[0].Login;
				sessData.userLogin = data[0].Login;
				console.log('sLogin='+sLogin);
				
				sSQL = 'SELECT "ID", "Name", "ImgPath", "DateFrom" FROM public."tEvent" where "IDStatus" = 1 union all SELECT "ID", "Name", "ImgPath", "DateFrom" FROM public."tEvent" where "IDStatus" = 1 union all SELECT "ID", "Name", "ImgPath", "DateFrom" FROM public."tEvent" where "IDStatus" = 1';
				console.log(sSQL);
				db.db.any(sSQL)
					.then(function(data){
						/*res.status(200)
						.json({
							status: 'success',
							data: data,
							message: 'Retrieved list'
						});*/
						console.log('events found:');
						console.log(data);
						events = data;
						sessData.eventsList = data;
						console.log('events: '+ JSON.stringify(events));
						
						console.log('rendering page...');
						console.log('sLogin='+sLogin);
						console.log('events: '+ JSON.stringify(events));
						//res.render('events', {title: 'Учет билетов', userLogin: sLogin, eventsList: JSON.stringify(events)});
						res.render('events', {title: 'Учет билетов', userLogin: sLogin, eventsList: events});
					})
					.catch(function(err){
						//return next(err);
						console.log('error of search actual events:');
						console.log(err);
					});
			})
			.catch(function(err){
				//return next(err);
				console.log('error of search user:');
				console.log(err);
			});
	}
})


router.get('/event/:id', function(req, res, next){
	var sLogin = "";
	var events = {};
	var sessData = req.session;
	if(sessData.userLogin){
		sLogin = sessData.userLogin;
		events = sessData.eventsList;
	}
	var eventID = req.params.id;
	console.log('sLogin='+sLogin+', eventID='+eventID);
	res.render('eventmap', {title: 'Учет билетов', userLogin: sLogin, eventsList: events, eventID: eventID});
})

router.get('/api/events', db.getList);
router.put('/api/events/:id', db.Edit);


module.exports = router;
