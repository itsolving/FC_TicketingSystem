class TemplateUtils{
	constructor(Client, conOptions){
		this.Client = Client;
		this.conOptions = conOptions;
	}
	insert(itemData, next){
		const clientRoles = new this.Client(this.conOptions);
		clientRoles.connect();
		let sSQLRoles = `insert into public."tTemplate" ("ID", "templateName", "templateUrl", "fileName")  
						values(nextval(\'"tTemplate_ID_seq"\'::regclass), '${itemData.templateName}', '${itemData.fileURL}', '${itemData.fileName}') RETURNING "ID"`;
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

		var templates = {};
		const client = new this.Client(this.conOptions);
		client.connect();

		var sSQL = 'SELECT * FROM public."tTemplate" ';
		console.log(sSQL);

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
					templates = qres.rows;
				}
			}
			client.end();
			next(templates);
		});
	}
	getByID(nID, next){
		const client = new this.Client(this.conOptions);
		let rowTemplateData = {};
		client.connect();
		var sSQL = `SELECT * FROM public."tTemplate" t where t."ID" = ${nID}`;
		console.log(sSQL);
		client.query(sSQL, (qerr, qres) => {
			if (qerr) {
				console.log(qerr ? qerr.stack : qres);
			}
			else {
				//console.log(qerr ? qerr.stack : qres);
				
				if (typeof qres.rowCount === 'undefined') {
					console.log('res.rowCount not found');
				}
				else {
					if (qres.rowCount == 0) {
						console.log('res.rowCount='+qres.rowCount);
					}
					else {
						rowTemplateData = qres.rows[0];
					}
				}
			}
			client.end();
			next(rowTemplateData);
		});
	}
}

module.exports = TemplateUtils;