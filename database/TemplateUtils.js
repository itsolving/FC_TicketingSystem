let rootUtils = require('./root.js');

class TemplateUtils extends rootUtils{
	constructor(Client, conOptions){
		super();
		this.Client = Client;
		this.conOptions = conOptions;
	}
	insert(itemData, next){
		
		let sSQL = `insert into public."tTemplate" ("ID", "templateName", "templateUrl", "fileName")  
						values(
							nextval(
							\'"tTemplate_ID_seq"\'::regclass), 
							'${itemData.templateName}', 
							'${itemData.fileURL}', 
							'${itemData.fileName}') 
						RETURNING "ID"`;

		console.log(sSQL);

		this.execute(sSQL, (data) => {
			next(data);
		})

	}
	getAll(next){

		let sSQL = 'SELECT * FROM public."tTemplate" ';
		console.log(sSQL);

		this.execute(sSQL, (templates) => {
			next(templates);
		})
	
	}
	getByID(nID, next){
		
		var sSQL = `SELECT * FROM public."tTemplate" t where t."ID" = ${nID}`;
		console.log(sSQL);

		this.execute(sSQL, (templates) => {
			if ( templates ){
				next(templates[0]);
			}
		})
		
	}
}

module.exports = TemplateUtils;