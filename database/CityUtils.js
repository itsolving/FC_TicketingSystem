let rootUtils = require('./root.js');

class CityUtils extends rootUtils{
	constructor(Client, conOptions){
		super();
		this.Client = Client;
		this.conOptions = conOptions;
	}
	getNameID(next){

		var sSQL = 'SELECT ct."ID", ct."Name" from public."tCity" ct ';
		console.log(sSQL);

		this.execute(sSQL, (cityList) => {
			next(cityList);
		})

	}
	
}

module.exports = CityUtils;