class TicketUtils{
	constructor(Client, conOptions){
		this.Client = Client;
		this.conOptions = conOptions;
	}
	updatePrice(nEventID, sectors, next){
		var sSQL = "";
		sectors.forEach(function(sector) {
			var sectorName = sector.name;
			var sectorPrice = sector.price;
			var RowN = sector.RowN;
			console.log("RowN" + RowN)
			var sUpdate = 'update public."tTicket" set "Price" = '+sectorPrice+' where "IDSeat" in (select s."ID" from public."tSeat" s where s."SectorName" = \''+sectorName+'\' AND s."RowN" = ' + RowN + ') and "IDEvent" = '+nEventID+';';
			sSQL = sSQL + sUpdate;
		});
		const client = new this.Client(this.conOptions);
		client.connect();
		console.log(sSQL);
		client.query(sSQL, (qerr, qres) => {
			if (qerr) {
				console.log("qerr:");
				console.log(qerr ? qerr.stack : qres);
				client.end();
				next(qerr);
				/*res.json({"ok": querr});*/
			}
			else {
				client.end();
				console.log(qres)
				next("OK")
				/*res.json({"ok": "OK"});*/
			}
		});
	}
	getByID(nID, next){

		var ticket = {};
		const client = new this.Client(this.conOptions);
		client.connect();

		var sSQL = 'SELECT tic."Price", tic."ID", tic."IDEvent", ' +
					' st."SectorName", st."RowN", st."SeatN",' + 
					' ev."Name" ' + 	
					' From public."tTicket" tic' + 
					' join public."tSeat" st on tic."IDSeat" = st."ID" ' +
					' join public."tEvent" ev on tic."IDEvent" = ev."ID" ' + 
					'WHERE tic."ID" = ' + nID;
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
					ticket = qres.rows[0];
				}
			}
			client.end();
			next(ticket);
		});
	}
}

module.exports = TicketUtils;