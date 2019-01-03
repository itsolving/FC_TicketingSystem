class AbonementUtils{
	constructor(Client, conOptions){
		this.Client = Client;
		this.conOptions = conOptions;
	}
	insert(itemData, next){
		const clientRoles = new this.Client(this.conOptions);
		clientRoles.connect();
		let sSQLRoles = `insert into public."tAbonement" ("ID", "Price", "SectorName", "SeatID", "RowN", "SeatN", "evensIDs")  
						values(nextval(\'"tEvent_ID_seq"\'::regclass), '${itemData.Price}', '${itemData.SectorName}', 
						'${itemData.SeatID}', '${itemData.RowN}', '${itemData.SeatN}', '${itemData.evensIDs}') RETURNING "ID"`;
		console.log(sSQLRoles);

		clientRoles.query(sSQLRoles, (qerrRoles, qresRoles) => {
			if (qerrRoles) {
				console.log(qerrRoles ? qerrRoles.stack : qresRoles);
			}
			else {				
				if (typeof qresRoles.rowCount === 'undefined') {
					console.log('res.rowCount not found');
				}
				else {
					if (qresRoles.rowCount == 0) {
						console.log('res.rowCount='+qresRoles.rowCount);
					}
					else {
						console.log(qresRoles.rows)
					}
				}
			}
			clientRoles.end();
			next(qresRoles.rows);
		});
	}
	getAll(next){

		var abonements = {};
		const client = new this.Client(this.conOptions);
		client.connect();

		var sSQL = 'SELECT * FROM public."tAbonement" ';
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
					abonements = qres.rows;
				}
			}
			client.end();
			next(abonements);
		});
	}
}

module.exports = AbonementUtils;