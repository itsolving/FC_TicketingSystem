var express = require('express');
var router = express.Router();
var db = require('../queries');

/* GET home page. */
/*router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});*/

router.get('/', function(req, res){
	res.render('index', {title: 'Главная страница'});
})

router.get('/api/events', db.getList);
router.put('/api/events/:id', db.Edit);
router.get('/adminexit', function(req, res){
	res.redirect('/');
});

module.exports = router;
