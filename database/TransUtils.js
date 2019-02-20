let rootUtils = require('./root.js');

class TransUtils extends rootUtils{
	constructor(Client, conOptions){
		super();
		this.Client = Client;
		this.conOptions = conOptions;
	}
	getAll(next){

		var sSQL = `SELECT tr."ID", tr."IDTicket", TO_CHAR(tr."Saledate", \'DD-MM-YYYY HH24:MI:SS\') as "Saledate",  
						tc."Price", 
						st."ID", sc."SectorName", rw."RowN", st."SeatN", trb."TribuneName" as "Tribune",
						ev."Name", 
						us."Email",
						ss."Name" as "StatusName" 
					FROM public."tTrans" tr 
					join public."tTicket" tc on tc."ID" = tr."IDTicket"
					join public."tSeat" st on st."ID" = tc."IDSeat"
					join public."tRowN" rw on rw."ID" = st."IDRowN"
					join public."tSector" sc on sc."ID" = rw."IDSector"
					join public."tTribune" trb on trb."ID" = sc."IDTribune"
					join public."tEvent" ev on ev."ID" = tc."IDEvent"
					join public."tStatus" ss on ss."ID" = tc."IDStatus"
					join public."tUser" us on us."ID" = tr."IDUserSaler"`;
					/*`SELECT tr."ID", tr."IDTicket", TO_CHAR(tr."Saledate", \'DD-MM-YYYY HH24:MI:SS\') as "Saledate",  
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
					join public."tStatus" ss on tic."IDStatus" = ss."ID" `;*/

		console.log(sSQL);

		this.execute(sSQL, (trans) => {
			next(trans);
		})
		
	}

	getAllFilters(filters, next){

		console.log(filters)

		var sSQL = `SELECT tr."ID", tr."IDTicket", TO_CHAR(tr."Saledate", \'DD-MM-YYYY HH24:MI:SS\') as "Saledate",  
						tc."Price", tc."IDEvent",
						st."ID", sc."SectorName", rw."RowN", st."SeatN", trb."TribuneName" as "Tribune",
						ev."Name", 
						us."Email",
						ss."Name" as "StatusName" 
					FROM public."tTrans" tr 
					join public."tTicket" tc on tc."ID" = tr."IDTicket"
					join public."tSeat" st on st."ID" = tc."IDSeat"
					join public."tRowN" rw on rw."ID" = st."IDRowN"
					join public."tSector" sc on sc."ID" = rw."IDSector"
					join public."tTribune" trb on trb."ID" = sc."IDTribune"
					join public."tEvent" ev on ev."ID" = tc."IDEvent"
					join public."tStatus" ss on ss."ID" = tc."IDStatus"
					join public."tUser" us on us."ID" = tr."IDUserSaler" `;
		if ( filters.eventID ){
			sSQL = sSQL + `WHERE tc."IDEvent" = ${filters.eventID} `;
		}
		if ( filters.begin ){
			sSQL = sSQL + `AND tr."Saledate" >='${filters.begin}'`;
		}
		if ( filters.end ){
			sSQL = sSQL + ` AND tr."Saledate" <= '${filters.end}'`;
		}
					/*`SELECT tr."ID", tr."IDTicket", TO_CHAR(tr."Saledate", \'DD-MM-YYYY HH24:MI:SS\') as "Saledate",  
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
					join public."tStatus" ss on tic."IDStatus" = ss."ID" `;*/

		console.log(sSQL);

		this.execute(sSQL, (trans) => {
			next(trans);
		})
		
	}
	cashierSelect(data, next){
		let sSQL = `SELECT tr."ID", tr."IDTicket", TO_CHAR(tr."Saledate", \'DD-MM-YYYY HH24:MI:SS\') as "Saledate",  
						tc."Price", 
						st."ID", sc."SectorName", rw."RowN", st."SeatN", trb."TribuneName" as "Tribune",
						ev."Name", 
						us."Email",
						ss."Name" as "StatusName" 
					FROM public."tTrans" tr 
					join public."tTicket" tc on tc."ID" = tr."IDTicket"
					join public."tSeat" st on st."ID" = tc."IDSeat"
					join public."tRowN" rw on rw."ID" = st."IDRowN"
					join public."tSector" sc on sc."ID" = rw."IDSector"
					join public."tTribune" trb on trb."ID" = sc."IDTribune"
					join public."tEvent" ev on ev."ID" = tc."IDEvent"
					join public."tStatus" ss on ss."ID" = tc."IDStatus"
					join public."tUser" us on us."ID" = tr."IDUserSaler"
					WHERE tr."IDUserSaler" = ${data.userID}`;
		console.log(sSQL);
		this.execute(sSQL, (trans) => {
			next(trans);
		})
	}
}

module.exports = TransUtils;