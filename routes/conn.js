//--- web interfaces: ---
//phpPgAdmin for DB: 
//develop: http://185.22.64.26:8000/
//master: http://185.22.64.31:8000/
//client prod: http://92.46.109.122:8780/
//
//web application: 
//develop: http://185.22.64.26:3000/events/
//master: http://185.22.64.31:3000/events/
//client prod: http://92.46.109.122:8109/events/
//-----------------------


//-------------------
//для админки использую "свой" коннект к БД. Потому что запарился с общим коннектом из файла "queries.js"
const { Client } = require('pg');
const conOptions = {
	user: 'pgadmin', //version for server
	//user: 'postgres', //local test on home-computer
	
	password: 'UrdodON9zu83BvtI6L', //version for server
	//password: 'qwe', //local test on home-computer Kuanysh
	//password: 'asd', //local test on home-computer Ivan
	
	//host: 'localhost', //version for server/
	host: '92.46.109.122', //local test on home by connect to dev-server
	//host: '92.46.109.122', //local test on home by connect to prod-server
	
	database: 'postgres',
	port: 5432,
};
//-------------------


module.exports = {
	connClient: Client,
	conOptions: conOptions
}