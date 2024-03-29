/* -------------------- РОЛИ ПОЛЬЗОВАТЕЛЕЙ -------------------- */
/*

   ID | Name	   			 | RoleType
---------------------------------------------------------------
	1 |	Админ  				 | 1		
---------------------------------------------------------------
	2 |	Кассир 				 | 1
---------------------------------------------------------------
	3 |	Устройство контроля  | 2
---------------------------------------------------------------
	4 |	API	   			     | 3
---------------------------------------------------------------
	5 |	online	  		     | 4
---------------------------------------------------------------

 */
/* ------------------------------------------------------------ */

let rootUtils = require('./root.js');

class RoleUtils extends rootUtils{
	constructor(Client, conOptions){
		super();
		this.Client = Client;
		this.conOptions = conOptions;
	}
	getNameID(next){

		var sSQL = 'SELECT r."ID", r."Name" from public."tRole" r ';
		console.log(sSQL);

		this.execute(sSQL, (roles) => {
			next(roles);
		})
		
	}
	
}

module.exports = RoleUtils;