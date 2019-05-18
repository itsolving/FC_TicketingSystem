let nodemailer = require('nodemailer'),
	md5 	   = require('md5');

class eMailVerification{
	constructor(){
		this.smtp = nodemailer.createTransport({
		    service: "Gmail",
		    auth: {
		        user: "ticketscloud.astana",
		        pass: "f5a175acac4a00aa702424d53b01903a"
		    }
		});
	}
	sendMail(data, tickets, next){
		let mailOptions={
	        to : data.mail,
	        subject : "Astana Arena | Билеты на мероприятие",
	        html : `Здравствуйте.<br> Ваши купленные билеты доступны по следующим ссылкам:<br><br>` 
	    }
	    tickets.forEach((ticket, index) => {
	    	let hash = md5((ticket.ID + ticket.IDEvent + ticket.Barcode));
	    	console.log(ticket);
	    	console.log((ticket.ID + ticket.IDEvent + ticket.Barcode) + " | " + hash);
	    	let link =`http://${data.req.get('host')}/cloud/ticket/${ticket.ID}/${hash}`;
	    	mailOptions.html = mailOptions.html + `<a href="${link}">Билет №${index+1}</a><br>`;
	    })
	    this.smtp.sendMail(mailOptions, (error, response) => {
		     if(error) console.log(error)
		     else next() 
	     })
	}

}

let Verification = new eMailVerification();

module.exports = Verification;