module.exports = (router, db, PageTitle) => {

	//вход на страницу выбранного мероприятия
	router.post('/beta/ticket/reserve/', function(req, res, next){
		//данные из сессии
		var sLogin = "";
		var nUserID = 0;
		var events = {};
		var sessData = req.session;
		if(sessData.userLogin){
			sLogin = sessData.userLogin;
			nUserID = sessData.userID;
			events = sessData.eventsList;
		}
		// нужна проверка на авторизацию кассы
		let params = req.body;
		params = JSON.stringify(params);
		params = JSON.parse(params);
		console.log(params);
		if ((typeof params['tickets[]']) == 'string' ) params['tickets[]'] = [params['tickets[]']];
		let sSQL = '';
		params['tickets[]'].forEach((item) => {
				// 4 status - резерв ( в данном случае - кассовый резерв )
				var sUpdate = `update public."tTicket" set "IDStatus" = 4
								where "ID" = ${item}
								AND "IDStatus" = 3;`;
				sSQL = sSQL + sUpdate;
		})
		db.db.any(sSQL)
			.then(() => {
				let sSQLTrans = '';
				params['tickets[]'].forEach(function(item) {

					var sTransInsert = `insert into public."tTrans" 
											( "IDTicket", "Saledate", "IDUserSaler" ) values 
											( ${item}, now(), ${5} ); `;
					sSQLTrans = sSQLTrans + sTransInsert;
				});
				db.db.any(sSQLTrans)
			});
		res.json({status: 'ok'})
	})
	
}