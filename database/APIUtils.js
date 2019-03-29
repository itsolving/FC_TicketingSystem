let rootUtils = require('./root.js');

class APIUtils extends rootUtils{
	constructor(Client, conOptions){
		super();
		this.Client = Client;
		this.conOptions = conOptions;
	}
	insert(itemData, next){
		
		let sSQL = `insert into public."tAPI" ("ID", "APIKey", "IDUser")  
						values(nextval(\'"tAPI_ID_seq"\'::regclass), '${itemData.APIKEY}', '${itemData.userID}') RETURNING "ID"`;

		this.execute(sSQL, (data) => {
			next(data);
		})

	}

	getByUserID(nID, next){

	
		let sSQL = `SELECT * FROM public."tAPI" api WHERE api."IDUser" = ${nID}`;
		this.execute(sSQL, (apis) => {
			next(apis || null)
		})
		
	}

	findByKey(APIKEY, next){

		let sSQL = `SELECT * FROM public."tAPI" api WHERE api."APIKey" = '${APIKEY}'`;

		this.execute(sSQL, (data) => {
			let answer = {success: false, userData: null};
			if ( data.length > 0 ){
				answer.success = true;
				answer.userData = data[0];
			}
			next(answer);
		})

	}
}

module.exports = APIUtils;