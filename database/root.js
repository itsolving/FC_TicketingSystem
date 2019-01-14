class rootUtils{
	execute(sSQL, next){
		let result = {};
		const client = new this.Client(this.conOptions);
		client.connect();
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
						result = qres.rows;
					}
				}
			}
			client.end();
			next(result);
		});
	}
}

module.exports = rootUtils;