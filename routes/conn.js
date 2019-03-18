
//-------------------
//для админки использую "свой" коннект к БД. Потому что запарился с общим коннектом из файла "queries.js"
const { Client } = require('pg');
const conOptions = {
	//user: 'pgadmin', //version for server
	user: 'postgres', //local test on home-computer
	
	//password: 'UrdodON9zu83BvtI6L', //version for server
    password: 'qwe', //local test on home-computer Kuanysh
	//password: 'asd', //local test on home-computer Ivan
	
	host: 'localhost', //version for server
	//host: '185.22.64.26', //local test on home by connect to dev-server
	
	database: 'postgres',
	port: 5432,
};
//-------------------


module.exports = {
	connClient: Client,
	conOptions: conOptions
}

