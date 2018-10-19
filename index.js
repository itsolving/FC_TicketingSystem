//подключаем модули
const express = require('express');
const app = express();
var session = require('express-session');
var cookieParser = require('cookie-parser');
var credentials = require('./credentials.js');
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var bodyParser = require('body-parser');

//определяем, что главная страница будет состоять из видов (view) с расширением ".handlebars"
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

//готовим инструмент для разбора текста
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//считываем секретный ключ
app.use(cookieParser(credentials.cookieSecret));

//определяем порт, на котором будет работать сайт
app.set('port', process.env.PORT || 3000);

//включаем сессии
app.use(session({
	resave: false,
	saveUninitialized: true,
	secret: credentials.cookieSecret, 
}));




//главная страница
//если в браузере адрес будет без указания страниц, например "site.com" или "site.com/"
app.get('/', function(req, res) {
	//var nClientID = 1;
	//res.render('home', {clientID: nClientID});
	res.render('home');
});


//открыли админку
//если в браузере будет набран адрес страницы админа, например "site.com/admin"
app.get('/admin', function(req, res) {
	var sLogin = "";
	var sessData = req.session;
	if (sessData.adminLogin != "") {
		sLogin = sessData.adminLogin;
	}
	res.render('adm', {adminLogin: sLogin});
});

//зашли в админку
//если со страницы админа будет запрос post
app.post('/admin', function(req, res) {
	//запомним параметры
	var sLogin = req.body.txLogin;
	var sPassword = req.body.txPassword;
	var sBtnLogin = req.body.btnLogin;
	//проверим сессию
	var sessData = req.session;
	if (sessData.adminLogin != "") {
		//если в сессии есть логин админа, значит мы уже логинились, запомним его
		sLogin = sessData.adminLogin;
	}
	else {
		//если в сессии нет логина, значит либо предыдущая сессия закрылась, либо мы еще не логинились
		//проверим, нажимали ли мы кнопку "войти"
		if (sBtnLogin == "Войти") {
			//если мы пытались логиниться, то надо сделать запрос в БД и запомнить найденный логин админа
			/*
			let sqlAdm = "SELECT ... "
				+"FROM Admins a "
				+"WHERE ... ";
			let queryAdm = db.query(sqlAdm, function(errAdm, admResult){
				if(errAdm) {throw errAdm;}
				var bFinish = false;
				admResult.forEach(function(row) {
					if (bFinish == false) {
						if (row.Email != "") {
							sLogin = row.Email;
							sessData.adminLogin = row.Email;
							bFinish = true;
						}
					}
				});
			});*/
		}
		else {
			//мы не можем попасть сюда, но все равно предусмотрим на всякий случай
			res.send('Ошибка входа');
		}
	}
	//открываем страницу админки
	res.render('adm', {adminLogin: sLogin});
});





app.use(function(req, res, next){
	console.log('Поиск URL : ' + req.url);
	next();
});


app.use(function(err, req, res, next){
	console.log('Error : ' + err.message);
	next();
});





app.use(function(req, res){
	res.type('text/html');
	res.status(404);
	res.render('404');
});

app.use(function(err, req, res, next){
	console.error(err.stack);
	res.status(500);
	res.render('500');
});




app.listen(app.get('port'), function(){
	console.log("Сайт запущен на http://localhost:" + app.get('port') + ' Нажмите Ctrl-C для остановки сайта');
});


