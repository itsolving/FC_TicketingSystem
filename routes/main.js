var express = require('express');
var router = express.Router();
var db = require('../queries');
var passwordHash = require('password-hash');


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
		var hashedPassword = passwordHash.generate(req.body.txPassword);
		//var hashedPassword = 'sha1$3I7HRwy7$cbfdac6008f9cab4083784cbd1874f76618d2a97'; if (passwordHash.verify('password123', hashedPassword)) {...};
		console.log('req.body.txPassword='+req.body.txPassword+', hashedPassword = '+hashedPassword);
		//sSQL = 'SELECT "Login" FROM public."tUser" where "isLock" = false and "IDRole" = 2 and "Login" = \''+req.body.txLogin+'\' and "Pwd" = \''+hashedPassword+'\'';
		sSQL = 'SELECT "Login", "Pwd" FROM public."tUser" where "isLock" = false and "IDRole" = 2 and "Login" = \''+req.body.txLogin+'\'';
		console.log(sSQL);
		db.db.any(sSQL)
			.then(function(data){
				/*res.status(200)
				.json({
					status: 'success',
					data: data,
					message: 'Retrieved list'
				});*/
				console.log('data[0].Login='+data[0].Login+', data[0].Pwd='+data[0].Pwd);
				if (passwordHash.verify(req.body.txPassword, data[0].Pwd)) {
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
				}
				else {
					res.redirect('/');
				}
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
	else {
		res.redirect('/');
		return;
	}
	var eventID = req.params.id;
	console.log('sLogin='+sLogin+', eventID='+eventID);
	res.render('eventmap', {title: 'Учет билетов', userLogin: sLogin, eventsList: events, eventID: eventID});
})


router.get('/event/:id/tickets', function(req, res){
	var sLogin = "";
	var events = {};
	var sessData = req.session;
	if(sessData.userLogin){
		sLogin = sessData.userLogin;
		events = sessData.eventsList;
	}
	else {
		res.redirect('/');
		return;
	}
	var eventID = req.params.id;
	var ticketsList = {};
	console.log('eventID='+eventID);
	
	if (eventID !== 'undefined') {
	
	sSQL = 'SELECT t."ID", t."Barcode", t."Price"::numeric "Price", t."IDSeat", t."IDEvent", t."IDStatus", t."IDEvent", '
			+'trim(s."SectorName") "SectorName", s."RowN", s."SeatN" FROM public."tTicket" t join public."tSeat" s on t."IDSeat" = s."ID" '
			+' where t."IDEvent" = ' + eventID;
	console.log(sSQL);
	db.db.any(sSQL)
		.then(function(data){
			console.log('ticketsList: '+ JSON.stringify(data));
			res.status(200)
			res.json({
				status: 'success',
				data: data//,
				//message: 'Retrieved list'
			});
			/*
			console.log('tickets found:');
			console.log(data);
			ticketsList = data;
			sessData.ticketsList = data;
			console.log('tickets: '+ JSON.stringify(ticketsList));
			
			console.log('rendering page...');
			console.log('sLogin='+sLogin);
			console.log('ticketsList: '+ JSON.stringify(ticketsList));
			//res.render('events', {title: 'Учет билетов', userLogin: sLogin, eventsList: JSON.stringify(events)});
			res.render('eventmap', {title: 'Учет билетов', userLogin: sLogin, eventsList: events, ticketsList: ticketsList});
			*/
		})
		.catch(function(err){
			//return next(err);
			console.log('error of search actual tickets:');
			console.log(err);
			res.status(err.status)
			.json({
				status: 'error',
				data: {}//,
				//message: 'Retrieved list'
			});
		});
	}
})


router.get('/api/events', db.getList);
router.put('/api/events/:id', db.Edit);


module.exports = router;
