let conn       = require('./../routes/conn.js'),
    Client 	   = conn.connClient,
	conOptions = conn.conOptions;


let abonement = require('./AbonementUtils.js'),
	event 	  = require('./EventsUtils.js'),
	trans     = require('./TransUtils.js'),
	seat  	  = require('./SeatUtils.js'),
	user      = require('./UserUtils.js'),
	role      = require('./RoleUtils.js'),
	city      = require("./CityUtils.js"),
	stadium   = require('./StadiumUtils.js'),
	ticket    = require('./TicketUtils.js'),
	template  = require('./TemplateUtils.js'),
	api		  = require('./APIUtils.js'),
	timer	  = require('./TimerUtils.js'),
	pricecol  = require('./PriceColorUtils.js'),
	payment   = require('./Payment.js');
// для всех

let db = {
	Abonement:  new abonement(Client, conOptions),
	Event: 	    new event(Client, conOptions),
	Trans:      new trans(Client, conOptions),
	Seat:       new seat(Client, conOptions),
	Users:      new user(Client, conOptions),
	Role:       new role(Client, conOptions),
	City:       new city(Client, conOptions),
	Stadium:    new stadium(Client, conOptions),
	Ticket:     new ticket(Client, conOptions),
	Template:   new template(Client, conOptions),
	API: 	    new api(Client, conOptions),
	Timer:      new timer(Client, conOptions),
	PriceColor: new pricecol(Client, conOptions),
	Payment:    new payment(Client, conOptions)
}

module.exports = db;