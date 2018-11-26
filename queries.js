/*
общий коннект к базе данных
*/

var promise = require('bluebird');
var options = {
	promiseLib : promise
}
var pgp = require('pg-promise')(options)
var connectString = 
	//'postgres://postgres:qwe@localhost:5432/postgres'; //local test on home-computer
	'postgres://pgadmin:UrdodON9zu83BvtI6L@localhost:5432/postgres'; //test on dev-server
var db = pgp(connectString);



//изначально хотел использовать эту функцию, но позже переписал код, а эта функция осталась ненужной
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

//подготовил функции, но так и не использовал
function Edit(req,res,next){}

/*function getUser(adminLogin, adminPwd){
	db.one('SELECT "Login" FROM public."tUser" where "isLock" = false and "IDRole" = 1 and "Login" = '''+adminLogin+''' and "Pwd" = '''+adminPwd+'''')
    .then(function (data) {
        console.log("DATA:", data.value);
		return data.value;
		/*return json({
				status: 'success',
				data: data,
				message: 'Found admin'
			});*\
    })
    .catch(function (error) {
        console.log("ERROR:", error);
		return "";
		/*return json({
				status: 'success',
				data: {},
				message: error
			});*\
    });
}*/



module.exports = {
	getList: getList,
	Edit: Edit,
	//getUser: getUser,
	db: db
}

