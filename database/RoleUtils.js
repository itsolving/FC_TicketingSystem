class RoleUtils{
	constructor(Client, conOptions){
		this.Client = Client;
		this.conOptions = conOptions;
	}
	getNameID(next){
		let rolesList = {};
		const clientRoles = new this.Client(this.conOptions);
		clientRoles.connect();
		var sSQLRoles = 'SELECT r."ID", r."Name" from public."tRole" r ';
		
		console.log(sSQLRoles);
		clientRoles.query(sSQLRoles, (qerrRoles, qresRoles) => {
			if (qerrRoles) {
				console.log(qerrRoles ? qerrRoles.stack : qresRoles);
			}
			else {
				//console.log(qerrRoles ? qerrRoles.stack : qresRoles);
				
				if (typeof qresRoles.rowCount === 'undefined') {
					console.log('res.rowCount not found');
				}
				else {
					if (qresRoles.rowCount == 0) {
						console.log('res.rowCount='+qresRoles.rowCount);
					}
					else {
						rolesList = qresRoles.rows;
					}
				}
			}
			clientRoles.end();
			next(rolesList);
		});
	}
	
}

module.exports = RoleUtils;