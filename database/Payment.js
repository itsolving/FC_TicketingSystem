let rootUtils = require('./root.js');

class APIUtils extends rootUtils{
	constructor(Client, conOptions){
		super();
		this.Client = Client;
		this.conOptions = conOptions;
	}
	insert(data, next){
		let sSQL = `INSERT INTO public."tPayment" ("IDPayment", "Status", "Tickets", "Email", "Phone", "Amount", "CreatedAt") 
						values( ${data.IDPayment}, 'new', '${data.Tickets}', null, null, ${data.Amount}, 'now()' )`;
		console.log(sSQL);

		this.execute(sSQL, (result) => {
			next(result);
		})
	}
	getNew(next){
		let sSQL = `SELECT * FROM public."tPayment" WHERE "Status" in ('new', 'process') ORDER BY random() limit 5`;
		console.log(sSQL);

		this.execute(sSQL, (result) => {
			next(result);
		})
	}

	getByPaymentID(data, next){
		let sSQL = `SELECT * FROM public."tPayment" WHERE "IDPayment" = ${data.id}`;
		console.log(sSQL);

		this.execute(sSQL, (result) => {
			next(result);
		})
	}

	changeData(data, next){
		// data = {
		// 	status: "success",
		// 	email: "example@domain.com",
		// 	phone: "1111111111",
		// 	paymentid: "2433123",
		//  amount: 500
		// }
		let sSQL = `UPDATE public."tPayment" SET `;
		if (data.status) sSQL += `"Status" = '${data.status}', `;
		if (data.email)  sSQL += `"Email"  = '${data.email}', `;
		if (data.phone)  sSQL += `"Phone"  = '${data.phone}', `;
		if (data.amount) sSQL += `"Amount" = ${data.amount}, `;
		if (data.created_at) sSQL += `"CreatedAt" = '${data.created_at}', `;
		if (data.updated_at) sSQL += `"UpdatedAt" = '${data.updated_at}' `;
		sSQL += ` WHERE "IDPayment" = ${data.paymentid}`
		console.log(sSQL);

		this.execute(sSQL, (result) => {
			next(result);
		})
	}

	getAll(next){
		let sSQL = `SELECT *, TO_CHAR("CreatedAt", \'DD-MM-YYYY\') as "CreatedAt", TO_CHAR("UpdatedAt", \'DD-MM-YYYY\') as "UpdatedAt" FROM public."tPayment"`;
		console.log(sSQL);

		this.execute(sSQL, (result) => {
			next(result);
		})
	}
}

module.exports = APIUtils;