const express = require('express');
const app = express();


var handlebars = require('express-handlebars').create({defaultLayout:'main'});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');


app.set('port', process.env.PORT || 3000);


//showing main page
app.get('/', (req, res) => {
	var nClientID = 1;
	res.render('home', {clientID: nClientID});
});








app.use(function(req, res, next){
	console.log('Looking for URL : ' + req.url);
	next();
});


app.use(function(err, req, res, next){
	console.log('Error : ' + err.message);
	next();
});

app.get('/about', function(req, res){
	res.render('about');
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
	console.log("Express started on http://localhost:" + app.get('port') + ' press Ctrl-C to terminate');
});


