let rootUtils = require('./root.js');

class TimerUtils extends rootUtils{
	constructor(Client, conOptions){
		super();
		this.Client = Client;
		this.conOptions = conOptions;
	}
	analysis(next){
		let sSQL = `SELECT tr."IDTicket", tr."ID" from public."tTrans" tr
					JOIN public."tTicket" tic on tic."ID" = tr."IDTicket" AND tic."IDStatus" = 4
					WHERE tr."CreateDate" < (now() - '60 minutes'::interval)
				`;
        console.log(sSQL);
		this.execute(sSQL, (data) => {
			console.log(data);
			next(data);

		})

	}
	deleteOld(ids, next){
		let sSQL = `DELETE FROM public."tTrans" tr WHERE tr."ID" in (${ids})`
		console.log(sSQL);

		this.execute(sSQL, (data) => {
			console.log(data);
			next(data);

		})
	}

	update(ids, next){
		let sSQL = `UPDATE public."tTicket" tic set "IDStatus" = 3 
					WHERE tic."ID" in (${ids})
					AND tic."IDStatus" = 4`;
        console.log(sSQL);

		this.execute(sSQL, (data) => {
			console.log(data)
			next(data);

		})
	}
	
}

module.exports = TimerUtils;