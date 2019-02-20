module.exports = (router, db, PageTitle, dbUtils) => {

	//вход на страницу выбранного мероприятия
	router.get('/beta/reports/trans/', function(req, res, next){
		console.log("get: /event/id");
		var eventID = req.params.id;
	
		var sessData = req.session;
		if(!sessData.cashier){
			res.redirect('/');
			return;
		}
		dbUtils.Trans.cashierSelect({userID: sessData.cashier.ID}, (data) => {
			
			if (!data.length){
				res.json({err: "Продажи отсутствуют"});
			}
			res.render('KassaTrans', {title: 'Продажа билетов', userLogin: sessData.cashier.login, transactions: data});
		    return;
		})
	})
	
}