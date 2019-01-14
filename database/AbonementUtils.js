let rootUtils = require('./root.js');

class AbonementUtils extends rootUtils{
	constructor(Client, conOptions){
		super();
		this.Client = Client;
		this.conOptions = conOptions;
	}
	insert(itemData, next){

		let sSQL = `insert into public."tAbonement" ("ID", "Price", "SectorName", "SeatID", "RowN", "SeatN", "evensIDs")  
						values(nextval(\'"tAbonement_ID_seq"\'::regclass), '${itemData.Price}', '${itemData.SectorName}', 
						'${itemData.SeatID}', '${itemData.RowN}', '${itemData.SeatN}', '${itemData.evensIDs}') RETURNING "ID"`;

		console.log(sSQL);

		this.execute(sSQL, (data) => {
			next(data);
		})

	}
	getAll(next){

		var sSQL = 'SELECT * FROM public."tAbonement" ';
		
		console.log(sSQL);

		this.execute(sSQL, (abonements) => {
			next(abonements);
		})

	}
}

module.exports = AbonementUtils;