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
							select st."ID"
							from public."tSeat" st 
							join public."tRowN" rw on rw."ID" = st."IDRowN" and rw."RowN" = ${RowN}
							join public."tSector" sc on sc."ID" = rw."IDSector" and sc."SectorName" = '${sectorName}'
							) 
							and "IDEvent" = ${nEventID};`;
							/*`update public."tTicket" 
							set "Price" = ${sectorPrice} 
							where "IDSeat" 
							in (
								select s."ID" from public."tSeat" s 
								where s."SectorName" = '${sectorName}' 
								AND s."RowN" = ${RowN}
							) 
							and "IDEvent" = ${nEventID};`;*/

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

		var sSQL = `SELECT t."Price", t."ID", t."IDEvent", t."IDStatus", t."Barcode", 
						sc."SectorName", rw."RowN", st."SeatN",
						ev."Name" 
					From public."tTicket" t
					join public."tEvent" ev on ev."ID" = t."IDEvent"
					join public."tSeat" st on st."ID" = t."IDSeat"
					join public."tRowN" rw on rw."ID" = st."IDRowN"
					join public."tSector" sc on sc."ID" = rw."IDSector"
					WHERE t."ID" = ${nID}`;
					/*`SELECT tic."Price", tic."ID", tic."IDEvent", tic."IDStatus", tic."Barcode", 
					st."SectorName", st."RowN", st."SeatN",
					ev."Name" 
					From public."tTicket" tic
					join public."tSeat" st on tic."IDSeat" = st."ID" 
					join public."tEvent" ev on tic."IDEvent" = ev."ID" 
					WHERE tic."ID" = ${nID}`;*/

		console.log(sSQL);

		this.execute(sSQL, (tickets) => {
			next(tickets[0]);
		})

	}
	getByIDBarcode(nID, Barcode, next){

		var sSQL = `SELECT t."Price", t."ID", t."IDEvent", t."Barcode",
						sc."SectorName", rw."RowN", st."SeatN", 
						ev."Name" 
					From public."tTicket" t
					join public."tEvent" ev on ev."ID" = t."IDEvent"
					join public."tSeat" st on st."ID" = t."IDSeat"
					join public."tRowN" rw on rw."ID" = st."IDRowN"
					join public."tSector" sc on sc."ID" = rw."IDSector"
					WHERE t."ID" = ${nID}
					AND t."Barcode" = ' ${Barcode}'`;
					/*`SELECT tic."Price", tic."ID", tic."IDEvent", tic."Barcode",
					st."SectorName", st."RowN", st."SeatN", 
					ev."Name" 
					From public."tTicket" tic 
					join public."tSeat" st on tic."IDSeat" = st."ID" 
					join public."tEvent" ev on tic."IDEvent" = ev."ID" 
					WHERE tic."ID" = ${nID}
					AND tic."Barcode" = ' ${Barcode}'`;*/
		console.log(sSQL);

		this.execute(sSQL, (tickets) => {
			next(tickets[0]);
		})

	}
	getByEventID(nID, next){

		var sSQL = `SELECT t."Price", t."ID", t."IDEvent",
						sc."SectorName", rw."RowN", st."SeatN",
						ev."Name" 
					From public."tTicket" t
					join public."tEvent" ev on ev."ID" = t."IDEvent"
					join public."tSeat" st on st."ID" = t."IDSeat"
					join public."tRowN" rw on rw."ID" = st."IDRowN"
					join public."tSector" sc on sc."ID" = rw."IDSector"
					WHERE t."IDEvent" = ${nID}`;
					/*`SELECT tic."Price", tic."ID", tic."IDEvent", 
					st."SectorName", st."RowN", st."SeatN",
					ev."Name" 
					From public."tTicket" tic
					join public."tSeat" st on tic."IDSeat" = st."ID" 
					join public."tEvent" ev on tic."IDEvent" = ev."ID" 
					WHERE tic."IDEvent" = ${nID}`;*/

		console.log(sSQL);

		this.execute(sSQL, (tickets) => {
			next(tickets);
		})

	}
	getAvailableByEventID(nID, next){
		var sSQL = `SELECT t."Price", t."ID", t."IDEvent", t."IDStatus",
						sc."SectorName", rw."RowN", st."SeatN",
						ev."Name" 
					From public."tTicket" t
					join public."tEvent" ev on ev."ID" = t."IDEvent"
					join public."tSeat" st on st."ID" = t."IDSeat"
					join public."tRowN" rw on rw."ID" = st."IDRowN"
					join public."tSector" sc on sc."ID" = rw."IDSector"
					WHERE t."IDEvent" = ${nID} 
					AND   t."IDStatus" = 3
					AND   t."Price" <> 0`;
					/*`SELECT tic."Price", tic."ID", tic."IDEvent", 
					st."SectorName", st."RowN", st."SeatN",
					ev."Name" 
					From public."tTicket" tic
					join public."tSeat" st on tic."IDSeat" = st."ID" 
					join public."tEvent" ev on tic."IDEvent" = ev."ID" 
					WHERE tic."IDEvent" = ${nID}`;*/

		console.log(sSQL);

		this.execute(sSQL, (tickets) => {
			next(tickets);
		})
	}
	setStatus(ticketID, statusID, next){
		this.getByID(ticketID, (ticket) => {
			console.log(ticket);
			this.getEventTickets(ticket.IDEvent, (event) => {
				console.log(event)
				if ( ( event.SaledTickets + 1 ) <= event.MaxTickets || event.MaxTickets == null || statusID != 5 ){
					let sSQL = `update public."tTicket"
								set "IDStatus" = ${statusID} 
								where "ID" = ${ticketID}`;

					console.log(sSQL);
					this.execute(sSQL, (data) => {
						console.log("******* STATUSID = " + statusID);
						
						
						next(data);
						
					})
				}
				else {
					next({err: "max tickers error"})
				}
			})
		})
		
	}

	getWithTemplate(nID, type, next){

		let TemplateType = '';
		switch(type){
			case 'A4':  	TemplateType = 'IDTemplateAdditional'; break;
			case 'custom':  TemplateType = 'IDTemplate'; break;
		}
		var sSQL = `SELECT t."Price", t."ID", t."IDEvent", t."IDStatus", t."Barcode", 
						sc."SectorName", rw."RowN", st."SeatN",
						ev."Name", TO_CHAR(ev."DateFrom", \'DD-MM-YYYY HH24:MI\') as "DateFrom", ev."ImgPath",
						tm."templateUrl", tm."fileName", tm."templateName",
						sd."Name" as "StadiumName",
						ct."Name" as "CityName"
					From public."tTicket" t
					join public."tEvent" ev on ev."ID" = t."IDEvent"
					join public."tTemplate" tm on tm."ID" = ev."${TemplateType}"
					join public."tStadium" sd on sd."ID" = ev."IDStadium"
					join public."tCity" ct on ct."ID" = sd."IDCity"
					join public."tSeat" st on st."ID" = t."IDSeat"
					join public."tRowN" rw on rw."ID" = st."IDRowN"
					join public."tSector" sc on sc."ID" = rw."IDSector"
					WHERE t."ID" = ${nID}`;
					
		console.log(sSQL);

		this.execute(sSQL, (tickets) => {
			next(tickets[0]);
		})

	}
	getMultiWithTemplate(ids, type, next){
		let TemplateType = '';
		switch(type){
			case 'A4':  	TemplateType = 'IDTemplateAdditional'; break;
			case 'custom':  TemplateType = 'IDTemplate'; break;
		}
		var sSQL = `SELECT t."Price", t."ID", t."IDEvent", t."IDStatus", t."Barcode", 
						sc."SectorName", rw."RowN", st."SeatN",
						ev."Name", TO_CHAR(ev."DateFrom", \'DD-MM-YYYY HH24:MI\') as "DateFrom", ev."ImgPath",
						tm."templateUrl", tm."fileName", tm."templateName",
						sd."Name" as "StadiumName",
						ct."Name" as "CityName"
					From public."tTicket" t
					join public."tEvent" ev on ev."ID" = t."IDEvent"
					join public."tTemplate" tm on tm."ID" = ev."${TemplateType}"
					join public."tStadium" sd on sd."ID" = ev."IDStadium"
					join public."tCity" ct on ct."ID" = sd."IDCity"
					join public."tSeat" st on st."ID" = t."IDSeat"
					join public."tRowN" rw on rw."ID" = st."IDRowN"
					join public."tSector" sc on sc."ID" = rw."IDSector"
					WHERE t."ID" in (${ids})`;
		this.execute(sSQL, (tickets) => {
			next(tickets);
		})
	}
	getBySeat(data, next){
		let sSQL = `SELECT tic."ID", tic."IDStatus" FROM public."tTicket" tic WHERE tic."IDSeat" = ${data.IDSeat} AND tic."IDEvent" in (${data.events})`;
		console.log(sSQL);
		this.execute(sSQL, (tickets) => {
			next(tickets)
		})
	}
	multiStatus(data, statusID, next){
		this.getByID(data[0], (ticket) => {
			this.getEventTickets(ticket.IDEvent, (event) => {
				if ( ( event.SaledTickets + data.length ) <= event.MaxTickets || event.MaxTickets == null ){
					var sSQL = `update public."tTicket" 
										set "IDStatus" = ${statusID}
										WHERE "ID" in (${data}) `;
					console.log(sSQL)

					this.execute(sSQL, (ans) => {
						next(ans);
					})
				}
				else {
					next({err: "max tickets err"})
				}
			})
		})
	
	}
	getSaled(data, next){
		let sSQL = `SELECT * FROM public."tTicket" tic WHERE tic."IDStatus" in (4, 5) AND tic."IDEvent" = ${data.IDEvent}`;
		console.log(sSQL);
		this.execute(sSQL, (tickets) => {
			next(tickets);
		})
	}
	import(data, next){
		let sSQL = '';
		let tickets = data.tickets;
		tickets.forEach(function(ticket) {
			
			var sUpdate = `update public."tTicket" 
							set ( "Price", "Barcode") = ( ${ticket.Price}, '${ticket.Barcode}' )
							
							where "IDSeat"
							in (
							select st."ID"
							from public."tSeat" st 
							join public."tRowN" rw on rw."ID" = st."IDRowN" and rw."RowN" = ${ticket.RowN}
							join public."tSector" sc on sc."ID" = rw."IDSector" and sc."SectorName" = '${ticket.SectorName}'
							join public."tSeat" ts on ts."SeatN" = ${ticket.SeatN}
							) 
							and "IDEvent" = ${ticket.IDEvent}`;
			console.log(sUpdate);

			sSQL = sSQL + sUpdate;
		});
		console.log(sSQL);
		this.execute(sSQL, (result) => {
			next(result);
		});
	}
	getByBarcode(data, next){
		// data = {
		// 	IDEvent: 1,
		// 	Barcode: 123456789123
		// }

		var sSQL = `SELECT "ID", "Barcode", "IDEvent" FROM public."tTicket" WHERE 
							"IDEvent" = ${data.IDEvent} AND 
							"Barcode" = '${data.Barcode}'`;
		this.execute(sSQL, (tickets) => {
			next(tickets[0]);
		})
	}
	insertPassage(ticket, next){
		// ticket = {
		// 	IDTicket: 1,
		// 	IDEvent: 1,
		// 	IDUserController: 1
		// }

		let sSQL = `insert into public."tTicketPassage" ("IDTicket", "IDEvent", "PassageDate", "IDUserController")  
						values(
							 ${ticket.IDTicket}, 
							 ${ticket.IDEvent}, 
							 now(),
							'${ticket.IDUserController}') 
						RETURNING "ID"`
		this.execute(sSQL, (results) => {
			next(results[0])
		})
	}
	getPassage(ticket, next){
		// ticket = {
		// 	IDEvent: 1,
		// 	ID: 1,
		// 	Barcode: 123456789123
		// }

		let sSQL = `SELECT * FROM public."tTicketPassage" WHERE 
						"IDEvent"  = ${ticket.IDEvent} AND
						"IDTicket" = ${ticket.ID}`;
		this.execute(sSQL, (result) => {
			next(result[0]);
		})
	}

	getEventTickets(id, next){
		let sSQL = `SELECT * FROM public."tEvent" WHERE "ID" = ${id}`;

		console.log(sSQL);
		this.execute(sSQL, (data) => {
			next(data[0]);
		}) 
	}

	customSelect(ids, next){
		let sSQL = `SELECT tic."IDStatus", tic."ID", tic."IDEvent", tic."Barcode"
						FROM public."tTicket" tic
						where "ID" in (${ids})`;

		console.log(sSQL);

		this.execute(sSQL, (data) => {
			next(data);
		})
	}
	setPriceByID(data, next){
		let sSQL = `update public."tTicket" 
						set "Price" = ${data.price}
						WHERE "ID" in (${data.tickets})`;
		console.log(sSQL);

		this.execute(sSQL, (data) => {
			next(data);
		})
	}

	getBySectorEvent(sectorName, eventID, next){
		let sSQL = `select row_to_json(t)
					from (
						select sectors."SectorName", sectors."SectorRu", sectors."minPrice", sectors."maxPrice", sectors."seatsLeft",
							(
								select array_to_json(array_agg(row_to_json(rw)))
								from
								(
									select row_all."RowN",
										(
											select array_to_json(array_agg(row_to_json(tick)))
											from
											(
												select tick_all."IDSeat", tick_all."SeatN", tick_all."RowN", tick_all."SectorName", tick_all."SectorRu", tick_all."Tribune", tick_all."TicketID", tick_all."Barcode", tick_all."Price", tick_all."IDStatus", tick_all."StatusName"
												from (
													SELECT t."ID" as "TicketID",
														trim(t."Barcode") "Barcode", t."Price"::numeric "Price",
														t."IDStatus", st."Name" "StatusName",
														t."IDSeat", s."SeatN", s."RowN",
														trim(s."SectorName") "SectorName", trim(s."SectorRu") "SectorRu", s."Tribune"
													FROM public."tTicket" t
													join public."tSeat" s on s."ID" = t."IDSeat" and s."IDRowN" = row_all."IDRowN"
													join public."tStatus" st on st."ID" = t."IDStatus"
													where 1=1
													and t."IDEvent" = ${eventID}
													and t."IDStatus" in (3, 4, 5)
												) tick_all
												where 1=1
												and tick_all."SectorName" = sectors."SectorName"
												and tick_all."RowN" = row_all."RowN"
												order by tick_all."SectorName", tick_all."RowN", tick_all."SeatN"
											) tick
										) as "tickets"
									from
									(
										SELECT r."ID" as "IDRowN", r."RowN", r."IDSector"
										FROM public."tRowN" r
										where 1=1
										and r."IDSector" = sectors."IDSector"
									) row_all
									where row_all."IDSector" = sectors."IDSector"
									order by row_all."RowN"
								) rw
							) as "sector_rows"
						from (
								SELECT tr."ID" as "IDTribune", Sc."ID" as "IDSector", sc."SectorName", sc."SectorRu",
									public."fGetMinPrice"(ev."ID", sc."SectorName") "minPrice",
									public."fGetMaxPrice"(ev."ID", sc."SectorName") "maxPrice",
									public."fGetSaleSeatCount"(ev."ID", sc."SectorName") "seatsLeft"
								FROM public."tEvent" ev
								join public."tTribune" tr on tr."IDStadium" = ev."IDStadium"
								join public."tSector" sc on sc."IDTribune" = tr."ID"
								where 1=1
								and ev."ID" = ${eventID}
								and upper(trim(sc."SectorName")) = upper('${sectorName}')
							) sectors
						where 1=1
						order by sectors."SectorName"
					) t `;
			this.execute(sSQL, (data) => {
				next(data);
			})
	}

	updatePriceSector(params, next){
		let sSQL = '';
		console.log(params);
		let sectors = params.sectors;

		sectors.forEach(function(sector) {
		
			var sUpdate = `update public."tTicket"
							set "Price" = ${sector.price}
							where "IDSeat" 
							in (
							select st."ID"
							from public."tSeat" st
							WHERE st."SectorName" = '${sector.sector}'
							) 
							and "IDEvent" = ${params.IDEvent}; `;

			sSQL = sSQL + sUpdate;
		});

		console.log(sSQL);
		this.execute(sSQL, (result) => {
			next(result);
		});
		
	}

	getByIDs(ids, next){

		let sSQL = `SELECT * FROM public."tTicket" WHERE "ID" in (${ids})`;

		console.log(sSQL);

		this.execute(sSQL, (result) => {
			next(result);
		})
	}

	getBarcodesByEvent(IDEvent, next){
		let sSQL = `SELECT "Barcode" FROM public."tTicket" WHERE "IDEvent" = ${IDEvent}`;

		console.log(sSQL);

		this.execute(sSQL, (result) => {
			next(result);
		})
	}

}

module.exports = TicketUtils;