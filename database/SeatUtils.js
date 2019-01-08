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
	getByStadiumID(nID, nIDStadiumEvent, next){
		var rowList = {};
		const clientRows = new this.Client(this.conOptions);
		clientRows.connect();
		var sSQLRows = `SELECT distinct s."RowN", s."SectorName", 
						(select max(t."Price") from public."tTicket" t 
						where t."IDEvent" = ${nID} 
						and t."IDSeat" = s."ID") 
						"Price" from public."tSeat" s where s."IDStadium" = ${nIDStadiumEvent}`;

		//var sSQLRows = 'SELECT distinct s."RowN" from public."tSeat" s where s."IDStadium" = '+ nIDStadiumEvent +' ORDER BY s."RowN" ';

			console.log(sSQLRows);
			clientRows.query(sSQLRows, (qerrRow, qresRows) => {
				if (qerrRow) {
					console.log("qerrRow:");
					console.log(qerrRow ? qerrRow.stack : qresRows);
				}
				else {
					//console.log(qerrRow ? qerrRow.stack : qresRows);
					
					if (typeof qresRows.rowCount === 'undefined') {
						console.log('rowList res.rowCount not found');
					}
					else {
						if (qresRows.rowCount == 0) {
							console.log('rowList res.rowCount='+qresRows.rowCount);
							rowList = qresRows.rows;
						}
						else {
							rowList = qresRows.rows;
						}
					}
				}
				clientRows.end();
				
				next(rowList);
			});
	}

	customSelect(nID, nIDStadiumEvent, next){
		var sectorList = {};
		const clientSectors = new this.Client(this.conOptions);
		clientSectors.connect();
		var sSQLSectors = `SELECT distinct s."SectorName" 
							from public."tSeat" s 
							where s."IDStadium" = ${nIDStadiumEvent} 
							ORDER BY s."SectorName"`;

		console.log(sSQLSectors);
		clientSectors.query(sSQLSectors, (qerrSectors, qresSectors) => {
			if (qerrSectors) {
				console.log("qerrSectors:");
				console.log(qerrSectors ? qerrSectors.stack : qresSectors);
			}
			else {
				//console.log(qerrSectors ? qerrSectors.stack : qresSectors);
				
				if (typeof qresSectors.rowCount === 'undefined') {
					console.log('sectorList res.rowCount not found');
				}
				else {
					if (qresSectors.rowCount == 0) {
						console.log('sectorList res.rowCount='+qresSectors.rowCount);
						sectorList = qresSectors.rows;
					}
					else {
						sectorList = qresSectors.rows;
					}
				}
			}
			clientSectors.end();
			next(sectorList);
		})
	}
}

module.exports = SeatUtils;