class CityUtils{
	constructor(Client, conOptions){
		this.Client = Client;
		this.conOptions = conOptions;
	}
	getNameID(next){
		var cityList = {};
		const client = new this.Client(this.conOptions);
		client.connect();
		var sSQL = 'SELECT ct."ID", ct."Name" from public."tCity" ct ';
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
						cityList = qres.rows;
					}
				}
			}
			client.end();
			next(cityList);
		});
	}
	
}

module.exports = CityUtils;