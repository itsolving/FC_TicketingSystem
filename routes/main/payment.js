module.exports = (router, db) => {
	router.get('/payment', function(req, res){
		var sLogin = "";
		var sessData = req.session;
		if(sessData.userLogin){
			sLogin = sessData.userLogin;
			console.log('sLogin='+sLogin);
		}
		var tickets = [{ID: 1, SectorName: 'E1bottom', RowN: 15, SeatN: 8, Price: 1000}, {ID: 2, SectorName: 'E1bottom', RowN: 15, SeatN: 9, Price: 1000}];
		res.render('paymentform', {title: 'Оплата билетов', userLogin: sLogin, eventID: 1, eventName: 'Test event', 
			eventDate: '28-01-2019 18:00', stadiumName: 'Астана-Арена', ticketList: tickets, payTotal: 2000});
	})

	router.post('/savePayment', function(req, res){
		res.send('Транзакция сохранена.');
	})

}