class TransUtils{
	constructor(Client, conOptions){
		this.Client = Client;
		this.conOptions = conOptions;
	}
	getAll(next){

		var trans = {};

		const client = new this.Client(this.conOptions);
		client.connect();

		var sSQL = `SELECT tr."ID", tr."IDTicket", TO_CHAR(tr."Saledate", \'DD-MM-YYYY HH24:MI:SS\') as "Saledate",  
					tic."Price", 
					st."ID", st."SectorName", st."RowN", st."SeatN", st."Tribune",
					ev."Name", 
					us."Email" 
					FROM public."tTrans" tr 
					join public."tTicket" tic on tr."IDTicket" = tic."ID" 
					join public."tSeat" st on tic."IDSeat" = st."ID"
					join public."tEvent" ev on tic."IDEvent" = ev."ID" 
					join public."tUser" us on tr."IDUserSaler" = us."ID" `;


		console.log(sSQL);

		client.query(sSQL, (qerr, qres) => {
			if (qerr) {
				console.log("qerr:");
				console.log(qerr ? qerr.stack : qres);
			}
			if (typeof qres.rowCount === 'undefined') {
				console.log('res.rowCount not found');
			}
			else {
				if (qres.rowCount == 0) {
					console.log('res.rowCount='+qres.rowCount);
				}
				else {
					trans = qres.rows;
				}
			}
			client.end();
			next(trans);
		});
	}
}

module.exports = TransUtils;