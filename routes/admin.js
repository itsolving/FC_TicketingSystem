var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('adminhome', {title: 'Админка', adminLogin: 'asd'});
});


module.exports = router;
