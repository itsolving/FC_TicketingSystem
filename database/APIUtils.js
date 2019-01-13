let rootUtils = require('./root.js');

class APIUtils extends rootUtils{
	constructor(Client, conOptions){
		super();
		this.Client = Client;
		this.conOptions = conOptions;
	}
	insert(itemData, next){
		let client = new this.Client(this.conOptions);
		client.connect();
		let sSQL = `insert into public."tAPI" ("ID", "APIKey", "IDUser")  
						values(nextval(\'"tAPI_ID_seq"\'::regclass), '${itemData.APIKEY}', '${itemData.userID}') RETURNING "ID"`;
		client.query(sSQL, (qerr, qres) => {
			if (qerr) {
				console.log(qerr ? qerr.stack : qres);
			}
			else {				
				if (typeof qres.rowCount === 'undefined') {
					console.log('res.rowCount not found');
				}
				else {
					if (qres.rowCount == 0) {
						console.log('res.rowCount='+qres.rowCount);
					}
					else {
						console.log(qres.rows)
					}
				}
			}
			client.end();
			next(qres.rows);
		});	
	}

	getByUserID(nID, next){

	
		let sSQL = `SELECT * FROM public."tAPI" api WHERE api."IDUser" = ${nID}`;
		this.execute(sSQL, (apis) => {
			next(apis || null)
		})
		
	}

	findByKey(APIKEY, next){
		let client = new this.Client(this.conOptions);
		client.connect();
		let sSQL = `SELECT * FROM public."tAPI" api WHERE api."APIKey" = '${APIKEY}'`;
		client.query(sSQL, (qerr, qres) => {
			let success = false;
			if (qerr) {
				console.log("qerr:");
				console.log(qerr ? qerr.stack : qres);
			}
			else {
				if (typeof qres.rowCount === 'undefined') {
					console.log('res.rowCount not found');
				}
				else {
					if (qres.rowCount == 0) {
						console.log('res.rowCount='+qres.rowCount);
					}
					else {
						success = true;
					}
				}
			}
			next(success);
		})
	}
}

module.exports = APIUtils;