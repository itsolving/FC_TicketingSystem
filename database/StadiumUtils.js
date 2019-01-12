class StadiumUtils{
	constructor(Client, conOptions){
		this.Client = Client;
		this.conOptions = conOptions;
	}
	getAll(next){
		const client = new this.Client(this.conOptions);
		var stadiums = {};
		client.connect()
		var sSQL = `SELECT sd."ID", sd."Name", sd."IDStatus", 
					sd."IDUserCreator", sd."CreateDate", sd."IDCity", 
					ct."Name" as "CityName", \'\' as "ImgPath" 
					FROM public."tStadium" sd 
					join public."tCity" ct on ct."ID" = sd."IDCity" 
					where sd."IDStatus" = 1 `;

		console.log(sSQL);
		client.query(sSQL, (qerr, qres) => {
			if (qerr) {
				console.log("qerr:");
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
						stadiums = qres.rows;
					}
				}
			}
			client.end();
			next(stadiums);
		});
	}
	getNameID(next){
		var stadiumList = {};
		const client = new this.Client(this.conOptions);
		client.connect();
		var sSQL = 'SELECT sd."ID", sd."Name" from public."tStadium" sd ';

		console.log(sSQL);
		client.query(sSQL, (qerr, qres) => {
			if (qerr) {
				console.log("qerr:");
				console.log(qerr ? qerr.stack : qres);
			}
			else {
				//console.log(qerr ? qerr.stack : qres);
				
				if (typeof qres.rowCount === 'undefined') {
					console.log('res.rowCount not found');
				}
				else {
					if (qres.rowCount == 0) {
						console.log('stadiumList res.rowCount='+qres.rowCount);
					}
					else {
						stadiumList = qres.rows;
					}
				}
			}
			client.end();
			next(stadiumList);
		});
	}
	getByID(nID, next){
		var rowStadiumData = {};
		const client = new this.Client(this.conOptions);
		client.connect();
		var sSQL = `SELECT sd."ID", sd."Name", \'\' as "ImgPath", sd."IDStatus", 
					sd."IDUserCreator", sd."CreateDate", sd."IDCity",
					ct."Name" as "CityName" 
					FROM public."tStadium" sd
					join public."tCity" ct on ct."ID" = sd."IDCity"
					where sd."IDStatus" = 1 and sd."ID" = ${nID}`;

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
						rowStadiumData = qres.rows;
					}
				}
			}
			client.end();
			next(rowStadiumData);
		})
	}
}

module.exports = StadiumUtils;