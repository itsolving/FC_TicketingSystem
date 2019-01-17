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
					where st."SectorName" = '${seatData.SectorName}'
					and st."RowN" = '${seatData.RowN}' 
					and st."SeatN" = '${seatData.SeatN}'`;
					
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
		var sSQL = `SELECT distinct s."RowN", s."SectorName", 
						(select max(t."Price") from public."tTicket" t 
						where t."IDEvent" = ${nID} 
						and t."IDSeat" = s."ID") 
						"Price" from public."tSeat" s where s."IDStadium" = ${nIDStadiumEvent}`;

			console.log(sSQL);

		this.execute(sSQL, (seats) => {
			next(seats);
		})

	}

	customSelect(nID, nIDStadiumEvent, next){

		var sSQL = `SELECT distinct s."SectorName" 
							from public."tSeat" s 
							where s."IDStadium" = ${nIDStadiumEvent} 
							ORDER BY s."SectorName"`;

		console.log(sSQL);

		this.execute(sSQL, (seats) => {
			next(seats);
		})
		
	}
}

module.exports = SeatUtils;