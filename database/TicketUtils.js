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
			var sUpdate = 'update public."tTicket" set "Price" = '+sectorPrice+' where "IDSeat" in (select s."ID" from public."tSeat" s where s."SectorName" = \''+sectorName+'\') and "IDEvent" = '+nEventID+';';
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
				next("OK")
				/*res.json({"ok": "OK"});*/
			}
		});
	}
}

module.exports = TicketUtils;