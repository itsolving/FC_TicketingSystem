var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('adminhome', {title: 'Админка', adminLogin: 'asd'});
});

router.get('/a', function(req, res, next) {
  res.render('adminhome', {title: 'Админка', adminLogin: 'aaa'});
});


module.exports = router;
