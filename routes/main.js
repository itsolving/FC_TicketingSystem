var express = require('express');
var router = express.Router();
var db = require('../queries');

/* GET home page. */
router.get('/', function(req, res, next){
	var sAdminLogin = "";
	var sessData = req.session;
	if(sessData.adminLogin){
		sAdminLogin = sessData.adminLogin;
	}
	res.render('index', {title: 'Учет билетов'});
})

router.get('/api/events', db.getList);
router.put('/api/events/:id', db.Edit);


module.exports = router;
