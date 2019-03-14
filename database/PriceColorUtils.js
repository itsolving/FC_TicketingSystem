let rootUtils = require('./root.js');

class PriceColorUtils extends rootUtils{
	constructor(Client, conOptions){
		super();
		this.Client = Client;
		this.conOptions = conOptions;
	}
	insert(item, next){
		
		let sSQL = `insert into public."tPriceColor" ( "IDEvent", "Color", "Price")  
						values( ${item.IDEvent}, '${item.Color}', ${item.Price}) RETURNING "ID"`;

		this.execute(sSQL, (data) => {
			next(data);
		})

	}

	getByID(nID, next){

	
		let sSQL = `SELECT * FROM public."tPriceColor" WHERE "ID" = ${nID}`;
		this.execute(sSQL, (data) => {
			next(data);
		})
		
	}

	getCustom(IDEvent, Price, next){
		let sSQL = `SELECT * FROM public."tPriceColor" WHERE "IDEvent" = ${IDEvent} AND "Price" = ${Price}`;
		this.execute(sSQL, (data) => {
			next(data);
		})
	}
	setCustom(IDEvent, Price, Color,  next){
		let sSQL = `UPDATE public."tPriceColor" 
					   SET "Color" = '${Color}'
					WHERE "IDEvent" = ${IDEvent}
					AND "Price" = ${Price}`;
		this.execute(sSQL, (data) => {
			next(data);
		})
	}
	setByID(ID, Color, next){
		let sSQL = `UPDATE public."tPriceColor" 
					   SET "Color" = '${Color}'
					WHERE "ID" = ${ID}`;
		this.execute(sSQL, (data) => {
			next(data);
		})
	}
}

module.exports = PriceColorUtils;