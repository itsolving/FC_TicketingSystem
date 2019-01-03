class SeatUtils{
	constructor(Client, conOptions){
		this.Client = Client;
		this.conOptions = conOptions;
	}
	getByPosition(seatData, next){
		var sSQL = `SELECT st."ID" 
					FROM public."tSeat" st 
					where st."SectorName" = '${seatData.SectorName}'
					and st."RowN" = '${seatData.RowN}' 
					and st."SeatN" = '${seatData.SeatN}'`;
		console.log(sSQL)
		const client = new this.Client(this.conOptions);
		client.connect();


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
					seatData.seatID = qres.rows[0].ID;
				}
			}
			client.end();
			next(seatData);
		})
		
	}
}

module.exports = SeatUtils;