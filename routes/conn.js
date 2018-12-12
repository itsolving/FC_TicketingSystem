
//-------------------
//для админки использую "свой" коннект к БД. Потому что запарился с общим коннектом из файла "queries.js"
const { Client } = require('pg');
const conOptions = {
	user: 'postgres', //local test on home-computer
	//user: 'pgadmin', //test on dev-server
	
	password: 'qwe', //local test on home-computer
	//password: 'UrdodON9zu83BvtI6L', //test on dev-server
	
	host: 'localhost',
	database: 'postgres',
	port: 5432,
};
//-------------------


module.exports = {
	connClient: Client,
	conOptions: conOptions
}
