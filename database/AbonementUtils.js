let rootUtils = require('./root.js');

class AbonementUtils extends rootUtils{
	constructor(Client, conOptions){
		super();
		this.Client = Client;
		this.conOptions = conOptions;
	}
	insert(itemData, next){

		let sSQL = `insert into public."tAbonement" ("ID", "Price", "SectorName", "SeatID", "RowN", "SeatN", "eventsIDs")  
						values(nextval(\'"tAbonement_ID_seq"\'::regclass), '${itemData.Price}', '${itemData.SectorName}', 
						'${itemData.SeatID}', '${itemData.RowN}', '${itemData.SeatN}', '${itemData.eventsIDs}') RETURNING "ID"`;

		console.log(sSQL);

		this.execute(sSQL, (data) => {
			next(data);
		})

	}
	getAll(next){

		let sSQL = 'SELECT * FROM public."tAbonement" ab join public."tStatus" ss on ss."ID" = ab."IDStatus"';
		
		console.log(sSQL);

		this.execute(sSQL, (abonements) => {
			next(abonements);
		})

	}
	insertTransaction(params, next){

		let sSQL = `insert into public."tAbonementTrans" ("IDAbonement", "IDUser", "Date")  
						values(${params.IDAbonement}, ${params.IDUser}, now()) RETURNING "ID")`;

		console.log(sSQL);

		this.execute(sSQL, (data) => {
			next(data);
		})
	}
	getTransactionByID(id, next){

		let sSQL = `SELECT * FROM public."tAbonementTrans" WHERE "ID" = ${id}`;

		console.log(sSQL);

		this.execute(sSQL, (data) => {
			next(data);
		})
	}
	getTransactionByUser(id, next){

		let sSQL = `SELECT * FROM public."tAbonementTrans" WHERE "IDUser" = ${id}`;

		console.log(sSQL);

		this.execute(sSQL, (data) => {
			next(data);
		})
	}
	getTransactionByAbonement(id, next){

		let sSQL = `SELECT * FROM public."tAbonementTrans" WHERE "IDAbonement" = ${id}`;

		console.log(sSQL);

		this.execute(sSQL, (data) => {
			next(data);
		})
	}

	updateStatus(params, next){

		// 5 - saled
		// 3 - available
		let sSQL = `update public."tAbonement"
						set "IDStatus" = ${params.status} 
						where "ID" = ${params.id}`;

		console.log(sSQL);

		this.execute(sSQL, (data) => {
			next(data);
		})
	}

	getAllTransaction(next){


		let sSQL = `SELECT tr."ID", tr."IDAbonement", tr."IDUser", TO_CHAR(tr."Date", \'DD-MM-YYYY HH24:MI:SS\') as "Date", 
						ab."Price", ab."IDStatus",
						us."Email",
						ss."Name" as "StatusName"
					FROM public."tAbonementTrans" tr 
					join public."tAbonement" ab on ab."ID" = tr."IDAbonement"
					join public."tStatus" ss on ss."ID" = ab."IDStatus"
					join public."tUser" us on us."ID" = tr."IDUser" `;

		console.log(sSQL);

		this.execute(sSQL, (data) => {
			next(data);
		})
	}
}

module.exports = AbonementUtils;