class Timer{
	constructor(period, dbUtils){
		this.period = parseInt(period) * 1000;
		this.dbUtils = dbUtils;
	}

	analysis(){

		dbUtils.Timer.analysis((result) => {
			console.log(result);
		})
	}


	
}


module.exports = Timer;