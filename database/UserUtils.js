let rootUtils = require('./root.js');

class UserUtils extends rootUtils{
	constructor(Client, conOptions){
		super();
		this.Client = Client;
		this.conOptions = conOptions;
	}
	getAll(next){
		var sSQL = `SELECT u."ID", u."Login", u."Pwd", u."IDRole", u."isLock", u."Email", r."Name" as "RoleName" 
					FROM public."tUser" u 
					join public."tRole" r on r."ID" = u."IDRole" 
					where 1=1 order by u."isLock", u."ID" `;
		console.log(sSQL);
		this.execute(sSQL, (users) => {
			next(users);
		})
	}
	getByID(nID, next){

		var sSQL = `SELECT u."ID", u."Login", u."Pwd", u."IDRole", u."isLock", u."Email", r."Name" as "RoleName" 
					FROM public."tUser" u 
					join public."tRole" r on r."ID" = u."IDRole"
					where u."ID" = ${nID}`;

		console.log(sSQL);

		this.execute(sSQL, (users) => {
			next(users);
		})
	
	}
	getByLogin(clientData, next){
		const client = new this.Client(this.conOptions);

		client.connect()
		var sSQL = `SELECT "ID", "Login", "Pwd", "IDRole" FROM public."tUser" where "isLock" = false and "IDRole" = 1 and "Login" = '${clientData.login}'`;

		console.log(sSQL);
		client.query(sSQL, (qerr, qres) => {
			client.end();
			next(qerr, qres);
		})
	}
	insert(UserData, postOperation, next){
		const client = new this.Client(this.conOptions);
		var users = {};
		client.connect()
		var sSQL = "";
		if (postOperation == "ins") {
			sSQL = `insert into public."tUser" ("ID", "Login", "Pwd", "IDRole", "isLock", "Email") values(
						nextval(\'"tUser_ID_seq"\'::regclass), 
						'${UserData.login}'||nextval(\'"tUserLogin_ID_seq"\'::regclass), 
						'${UserData.password}', 
						${UserData.IDRole}, 
						${UserData.isLock}, 
						'${UserData.email}') 
					RETURNING "ID"`;
			console.log(sSQL);
			client.query(sSQL, (qerr, qres) => {
				var newUserID = 0;
				var sResultMsg = "";
				if (qerr) {
					console.log("qerr:");
					console.log(qerr ? qerr.stack : qres);
					sResultMsg = qerr.stack;
				}
				else {
					console.log(qres.rows);
					newUserID = qres.rows[0].ID;
					console.log("newUserID="+newUserID);
					sResultMsg = "ok, new UserID="+newUserID;
				}
				client.end();
				//res.redirect('/admin/user/'+newUserID);
				next({ResultMsg: sResultMsg, ID: newUserID});
			});
		}
	}
	updateStatus(userData, next){
		const client = new this.Client(this.conOptions);
		client.connect();
		var sSQL = "";
		if (userData.sPostOperation == "del") {
			//нет поля IDStatus, мы лишь блокируем юзера, поэтому функции удаления не будет
			sSQL = `update public."tUser" set "IDStatus"=6 where "ID" = ${userData.nID}`;
		} else {
			sSQL = `update public."tUser" set 
					"Login"='${userData.sLogin}', 
					"Pwd"='${userData.sPwd}', 
					"IDRole"=${userData.nIDRole}, 
					"isLock"=${userData.bIsLock}, 
					"Email" = '${userData.sEmail}'
					where "ID" = ${userData.nID}`;
		}
		console.log(sSQL);
		client.query(sSQL, (qerr, qres) => {
			var sResMsg = "";
			if (userData.sPostOperation == "del") {
				sResMsg = "Удалено";
			}
			else {
				sResMsg = "Сохранено";
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

	cashierLogin(login, next){
		let sSQL = `SELECT "ID", "Login", "Pwd", "IDRole" 
					FROM public."tUser" 
					WHERE "isLock" = false and "IDRole" in (2,3,4,6) 
					AND "Login" = '${login}'`;
		console.log(sSQL);
		this.execute(sSQL, (data) => {
			next(data);
		})

	}
}

module.exports = UserUtils;