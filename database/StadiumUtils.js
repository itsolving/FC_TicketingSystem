let rootUtils = require('./root.js');

class StadiumUtils extends rootUtils{
	constructor(Client, conOptions){
		super();
		this.Client = Client;
		this.conOptions = conOptions;
	}
	getAll(next){

		var sSQL = `SELECT sd."ID", sd."Name", sd."IDStatus", 
					sd."IDUserCreator", sd."CreateDate", sd."IDCity", 
					ct."Name" as "CityName", \'\' as "ImgPath" 
					FROM public."tStadium" sd 
					join public."tCity" ct on ct."ID" = sd."IDCity" 
					where sd."IDStatus" = 1 `;

		console.log(sSQL);

		this.execute(sSQL, (stadiums) => {
			next(stadiums);
		})

	}
	getNameID(next){

		var sSQL = 'SELECT sd."ID", sd."Name" from public."tStadium" sd ';
		console.log(sSQL);

		this.execute(sSQL, (stadiums) => {
			next(stadiums);
		})

	}
	getByID(nID, next){

		var sSQL = `SELECT sd."ID", sd."Name", \'\' as "ImgPath", sd."IDStatus", 
					sd."IDUserCreator", sd."CreateDate", sd."IDCity",
					ct."Name" as "CityName" 
					FROM public."tStadium" sd
					join public."tCity" ct on ct."ID" = sd."IDCity"
					where sd."IDStatus" = 1 and sd."ID" = ${nID}`;

		console.log(sSQL);

		this.execute(sSQL, (stadiums) => {
			next(stadiums);
		})

	}
}

module.exports = StadiumUtils;