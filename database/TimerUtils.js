let rootUtils = require('./root.js');

class APIUtils extends rootUtils{
	constructor(Client, conOptions){
		super();
		this.Client = Client;
		this.conOptions = conOptions;
	}
	analysis(next){
		
		let sSQL = `SELECT * FROM public."tTicket" tic WHERE tic."IDStatus" = 4 
		AND tic."CreateDate" < NOW() - INTERVAL '20 min'`;
        console.log(sSQL);

		this.execute(sSQL, (data) => {
			console.log(data)
			next(data);

		})

	}

	
}

module.exports = APIUtils;