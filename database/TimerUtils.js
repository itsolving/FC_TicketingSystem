let rootUtils = require('./root.js');

class TimerUtils extends rootUtils{
	constructor(Client, conOptions){
		super();
		this.Client = Client;
		this.conOptions = conOptions;
	}
	analysis(next){
		
		let sSQL = `SELECT tr."IDTicket" from public."tTrans" 
					JOIN public."tTicket" tic on tic."ID" = trans."IDTicket" 
					AND tic."IDStatus" = 4
					AND tic."CreateDate" < now()::timestamp - INTERVAL '20 min'
				`;
        console.log(sSQL);

		this.execute(sSQL, (data) => {
			console.log(data)
			next(data);

		})

	}

	update(next){
		let sSQL = `update public."tTicket" tic set "IDStatus" = 3 WHERE tic."IDStatus" = 4 
		AND tic."CreateDate" < (now() - (20 * '-1 minute'))
				RETURNING tic."ID"`;
        console.log(sSQL);

		this.execute(sSQL, (data) => {
			console.log(data)
			next(data);

		})
	}
	
}

module.exports = TimerUtils;