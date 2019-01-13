let rootUtils = require('./root.js');

class TemplateUtils extends rootUtils{
	constructor(Client, conOptions){
		super();
		this.Client = Client;
		this.conOptions = conOptions;
	}
	insert(itemData, next){
		const clientRoles = new this.Client(this.conOptions);
		clientRoles.connect();
		let sSQLRoles = `insert into public."tTemplate" ("ID", "templateName", "templateUrl", "fileName")  
						values(
							nextval(
							\'"tTemplate_ID_seq"\'::regclass), 
							'${itemData.templateName}', 
							'${itemData.fileURL}', 
							'${itemData.fileName}') 
						RETURNING "ID"`;

		console.log(sSQLRoles);

		clientRoles.query(sSQLRoles, (qerrRoles, qresRoles) => {
			if (qerrRoles) {
				console.log(qerrRoles ? qerrRoles.stack : qresRoles);
			}
			else {				
				if (typeof qresRoles.rowCount === 'undefined') {
					console.log('res.rowCount not found');
				}
				else {
					if (qresRoles.rowCount == 0) {
						console.log('res.rowCount='+qresRoles.rowCount);
					}
					else {
						console.log(qresRoles.rows)
					}
				}
			}
			clientRoles.end();
			next(qresRoles.rows);
		});
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