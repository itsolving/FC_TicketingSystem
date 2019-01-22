let rootUtils = require('./root.js');

class SeatUtils extends rootUtils{
	constructor(Client, conOptions){
		super();
		this.Client = Client;
		this.conOptions = conOptions;
	}
	getByPosition(seatData, next){
		var sSQL = `SELECT st."ID" 
					FROM public."tSeat" st 
					join public."tRowN" rw on rw."ID" = st."IDRowN" and rw."RowN" = ${seatData.RowN}
					join public."tSector" sc on sc."ID" = rw."IDSector" and sc."SectorName" = '${seatData.SectorName}'
					where 1=1
					and st."SeatN" = ${seatData.SeatN}`;
					/*`SELECT st."ID" 
					FROM public."tSeat" st 
					where st."SectorName" = '${seatData.SectorName}'
					and st."RowN" = '${seatData.RowN}' 
					and st."SeatN" = '${seatData.SeatN}'`;*/
		console.log(sSQL);

		this.execute(sSQL, (seats) => {
			console.log(seats)
			if ( seats[0] ){
				seatData.seatID = seats[0].ID;
				next(seatData);
			}
			else next(null);
		})
		
	}
	getByStadiumID(nID, nIDStadiumEvent, next){
		var sSQL = `SELECT distinct rw."RowN", sc."SectorName",
						(select max(t."Price")
						 from public."tTicket" t
						 join public."tSeat" st on st."ID" = t."IDSeat" and st."IDRowN" = rw."ID"
						 where t."IDEvent" = ${nID}
						) as "Price"
					from public."tRowN" rw
					join public."tSector" sc on sc."ID" = rw."IDSector"
					join public."tTribune" tr on tr."ID" = sc."IDTribune" and tr."IDStadium" = ${nIDStadiumEvent}`;
					/*`SELECT distinct s."RowN", s."SectorName", 
						(select max(t."Price") from public."tTicket" t 
						where t."IDEvent" = ${nID} 
						and t."IDSeat" = s."ID") 
						"Price" from public."tSeat" s where s."IDStadium" = ${nIDStadiumEvent}`;*/

			console.log(sSQL);

		this.execute(sSQL, (seats) => {
			next(seats);
		})

	}

	customSelect(nID, nIDStadiumEvent, next){

		var sSQL = `SELECT distinct sc."SectorName" 
					from public."tSector" sc
					join public."tTribune" tr on tr."ID" = sc."IDTribune" and tr."IDStadium" = ${nIDStadiumEvent}
					ORDER BY sc."SectorName"`;
					/*`SELECT distinct s."SectorName" 
							from public."tSeat" s 
							where s."IDStadium" = ${nIDStadiumEvent} 
							ORDER BY s."SectorName"`;*/

		console.log(sSQL);

		this.execute(sSQL, (seats) => {
			next(seats);
		})
		
	}
}

module.exports = SeatUtils;