class UserUtils{
	constructor(Client, conOptions){
		this.Client = Client;
		this.conOptions = conOptions;
	}
	getAll(next){
		const client = new this.Client(this.conOptions);
		var users = {};
		client.connect()
		var sSQL = 'SELECT u."ID", u."Login", u."Pwd", u."IDRole", u."isLock", u."Email", r."Name" as "RoleName" '+
					'FROM public."tUser" u '+
					'join public."tRole" r on r."ID" = u."IDRole" ' +
					'where 1=1 order by u."isLock", u."ID" ';
		console.log(sSQL);
		client.query(sSQL, (qerr, qres) => {
			if (qerr) {
				console.log(qerr ? qerr.stack : qres);
			}
			else {
				//console.log(qerr ? qerr.stack : qres);
				
				if (typeof qres.rowCount === 'undefined') {
					console.log('res.rowCount not found');
				}
				else {
					if (qres.rowCount == 0) {
						console.log('res.rowCount='+qres.rowCount);
					}
					else {
						users = qres.rows;
					}
				}
			}
			client.end();
			next(users);
		});
	}
	getByID(nID, next){
		const client = new this.Client(this.conOptions);
		let rowUserData = {};
		client.connect();
		var sSQL = 'SELECT u."ID", u."Login", u."Pwd", u."IDRole", u."isLock", u."Email", r."Name" as "RoleName" '+
					'FROM public."tUser" u '+
					'join public."tRole" r on r."ID" = u."IDRole" ' +
					'where u."ID" = '+nID;
		console.log(sSQL);
		client.query(sSQL, (qerr, qres) => {
			if (qerr) {
				console.log(qerr ? qerr.stack : qres);
			}
			else {
				//console.log(qerr ? qerr.stack : qres);
				
				if (typeof qres.rowCount === 'undefined') {
					console.log('res.rowCount not found');
				}
				else {
					if (qres.rowCount == 0) {
						console.log('res.rowCount='+qres.rowCount);
					}
					else {
						rowUserData = qres.rows;
					}
				}
			}
			client.end();
			next(rowUserData);
		});
	}
	getByLogin(clientData, next){
		const client = new this.Client(this.conOptions);

		client.connect()
		var sSQL = `SELECT "Login", "Pwd" FROM public."tUser" where "isLock" = false and "IDRole" = 1 and "Login" = '${clientData.login}'`;
		console.log(sSQL);
		client.query(sSQL, (qerr, qres) => {
			client.end();
			next(qerr, qres);
		})
	}
	updateStatus(userData, next){
		const client = new this.Client(this.conOptions);
		client.connect();
		//res.send('функция находится в разработке. Скоро будет готова');
		var sSQL = "";
		if (userData.sPostOperation == "del") {
			//нет поля IDStatus, мы лишь блокируем юзера, поэтому функции удаления не будет
			sSQL = 'update public."tUser" set "IDStatus"=6 '+
					'where "ID" = '+userData.nID;
		} else {
			sSQL = 'update public."tUser" set "Login"=\''+userData.sLogin+'\', '+
					'"IDRole"='+userData.nIDRole+', "isLock"='+userData.bIsLock+', "Email" = \''+userData.sEmail+'\' '+
					'where "ID" = '+userData.nID;
		}
		console.log(sSQL);
		client.query(sSQL, (qerr, qres) => {
			var sResMsg = "";
			if (userData.sPostOperation == "del") {
				sResMsg = "Удалил";
			}
			else {
				sResMsg = "Сохранил";
			}
			if (qerr) {
				console.log("qerr:");
				console.log(qerr ? qerr.stack : qres);
				sResMsg = "Ошибка выполнения: "+qerr;
			}
			client.end();
			next(sResMsg);
		});
	}
}

module.exports = UserUtils;