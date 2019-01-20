let rootUtils = require('./root.js');

class TicketUtils extends rootUtils{
	constructor(Client, conOptions){
		super();
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
			var sUpdate = `update public."tTicket" 
							set "Price" = ${sectorPrice} 
							where "IDSeat" 
							in (
								select s."ID" from public."tSeat" s 
								where s."SectorName" = '${sectorName}' 
								AND s."RowN" = ${RowN}
							) 
							and "IDEvent" = ${nEventID};`;

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

		var sSQL = `SELECT tic."Price", tic."ID", tic."IDEvent", tic."IDStatus", tic."Barcode", 
					st."SectorName", st."RowN", st."SeatN",
					ev."Name" 
					From public."tTicket" tic
					join public."tSeat" st on tic."IDSeat" = st."ID" 
					join public."tEvent" ev on tic."IDEvent" = ev."ID" 
					WHERE tic."ID" = ${nID}`;

		console.log(sSQL);

		this.execute(sSQL, (tickets) => {
			next(tickets[0]);
		})

	}
	getByIDBarcode(nID, Barcode, next){

		var sSQL = `SELECT tic."Price", tic."ID", tic."IDEvent", tic."Barcode",
					st."SectorName", st."RowN", st."SeatN", 
					ev."Name" 
					From public."tTicket" tic 
					join public."tSeat" st on tic."IDSeat" = st."ID" 
					join public."tEvent" ev on tic."IDEvent" = ev."ID" 
					WHERE tic."ID" = ${nID}
					AND tic."Barcode" = ' ${Barcode}'`;
		console.log(sSQL);

		this.execute(sSQL, (tickets) => {
			next(tickets[0]);
		})

	}
	getByEventID(nID, next){

		var sSQL = `SELECT tic."Price", tic."ID", tic."IDEvent", 
					st."SectorName", st."RowN", st."SeatN",
					ev."Name" 
					From public."tTicket" tic
					join public."tSeat" st on tic."IDSeat" = st."ID" 
					join public."tEvent" ev on tic."IDEvent" = ev."ID" 
					WHERE tic."IDEvent" = ${nID}`;

		console.log(sSQL);

		this.execute(sSQL, (tickets) => {
			next(tickets);
		})

	}
	setStatus(ticketID, statusID, next){
		let sSQL = `update public."tTicket"
					set "IDStatus" = ${statusID} 
					where "ID" = ${ticketID}`;

		console.log(sSQL);
		this.execute(sSQL, (data) => {
			console.log(data);
			next(data);
		})
		
	}

	getWithTemplate(nID, next){

		var sSQL = `SELECT tic."Price", tic."ID", tic."IDEvent", tic."IDStatus", tic."Barcode", 
					st."SectorName", st."RowN", st."SeatN",
					ev."Name", TO_CHAR(ev."DateFrom", \'DD-MM-YYYY HH24:MI\') as "DateFrom", ev."ImgPath",
					tm."templateUrl", tm."fileName", tm."templateName",
					sd."Name" as "StadiumName",
					city."Name" as "CityName"
					From public."tTicket" tic
					join public."tSeat" st on tic."IDSeat" = st."ID" 
					join public."tEvent" ev on tic."IDEvent" = ev."ID" 
					join public."tTemplate" tm on ev."IDTemplate" = tm."ID"
					join public."tStadium" sd on ev."IDStadium" = sd."ID"
					join public."tCity" city on sd."IDCity" = city."ID"
					WHERE tic."ID" = ${nID}`;

		console.log(sSQL);

		this.execute(sSQL, (tickets) => {
			next(tickets[0]);
		})

	}
}

module.exports = TicketUtils;