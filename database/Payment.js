let rootUtils = require('./root.js');

class APIUtils extends rootUtils{
	constructor(Client, conOptions){
		super();
		this.Client = Client;
		this.conOptions = conOptions;
	}
	insert(data, next){
		let sSQL = `INSERT INTO public."tPayment" ("IDPayment", "Status", "Tickets", "Email", "Phone", "Amount") 
						values( ${data.IDPayment}, 'new', '${data.Tickets}', null, null, ${data.Amount} )`;
		console.log(sSQL);

		this.execute(sSQL, (result) => {
			next(result);
		})
	}
	getNew(next){
		let sSQL = `SELECT * FROM public."tPayment" WHERE "Status" in ('new', 'process') `;
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
		if (data.amount) sSQL += `"Amount" = ${data.amount} `;
		sSQL += ` WHERE "IDPayment" = ${data.paymentid}`
		console.log(sSQL);

		this.execute(sSQL, (result) => {
			next(result);
		})
	}
}

module.exports = APIUtils;