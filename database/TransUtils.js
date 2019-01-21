let rootUtils = require('./root.js');

class TransUtils extends rootUtils{
	constructor(Client, conOptions){
		super();
		this.Client = Client;
		this.conOptions = conOptions;
	}
	getAll(next){

		var sSQL = `SELECT tr."ID", tr."IDTicket", TO_CHAR(tr."Saledate", \'DD-MM-YYYY HH24:MI:SS\') as "Saledate",  
					tic."Price", 
					st."ID", st."SectorName", st."RowN", st."SeatN", st."Tribune",
					ev."Name", 
					us."Email",
					ss."Name" as "StatusName" 
					FROM public."tTrans" tr 
					join public."tTicket" tic on tr."IDTicket" = tic."ID" 
					join public."tSeat" st on tic."IDSeat" = st."ID"
					join public."tEvent" ev on tic."IDEvent" = ev."ID" 
					join public."tUser" us on tr."IDUserSaler" = us."ID"
					join public."tStatus" ss on tic."IDStatus" = ss."ID" `;

		console.log(sSQL);

		this.execute(sSQL, (trans) => {
			next(trans);
		})
		
	}
}

module.exports = TransUtils;