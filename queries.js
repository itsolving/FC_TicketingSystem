var promise = require('bluebird');
var options = {
	promiseLib : promise
}
var pgp = require('pg-promise')(options)
var connectString = //'postgres://pgadmin:UrdodON9zu83BvtI6L@185.22.64.31:8000/test';
	//'postgres://postgres:qwe@localhost:5432/postgres'; //local test on home-computer
	'postgres://pgadmin:UrdodON9zu83BvtI6L@localhost:5432/postgres';
var db = pgp(connectString);

function getList(req, res, next) {
	db.any('SELECT "ID", "Name" FROM public."tEvent";')
		.then(function(data){
			res.status(200)
			.json({
				status: 'success',
				data: data,
				message: 'Retrieved list'
			});
		})
		.catch(function(err){
			return next(err);
		})
}


function Edit(req,res,next){}

module.exports = {
	getList: getList,
	Edit: Edit
}
