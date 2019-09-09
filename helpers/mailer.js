let nodemailer = require('nodemailer'),
	md5 	   = require('md5');

class eMailVerification{
	constructor(){
		this.smtp = nodemailer.createTransport({
			service: 'Yandex',
		    auth: {
		      user: 'tickets@fcastana.kz', 
		      pass: 'qwe123+++'
		    }
		});
	}
	sendMail(data, tickets, next){
		let mailOptions={
	        to : data.mail,
	        from: 'tickets@fcastana.kz',
	        subject : "Astana Arena | Билеты на мероприятие",
	        html : `Здравствуйте.<br> Ваши купленные билеты доступны по следующей ссылке:<br><br>` 
	    }

	    let hash = md5((tickets[0].ID + tickets[0].IDEvent + tickets[0].Barcode))

	    let tickids = '';

	    for ( var i = 0; i < tickets.length; i++){
            if ( i == tickets.length-1 ){
            	tickids += `${tickets[i].ID}`;
          	} 
         	else {
           		tickids += `${tickets[i].ID},`;
            }
        }

        let host = "92.46.109.122:8109";
        // let host = data.req.get('host');
        // if ( data.req.get('host') != 'localhost'){
        // 	host = host + ":8109";
        // }
	    let link = `http://${host}/kassa/get/main/tickets/A4/${hash}/${tickids}`;

	    mailOptions.html = mailOptions.html + `<a href="${link}">Билеты</a><br>`;

	    this.smtp.sendMail(mailOptions, (error, response) => {
		     if(error) console.log(error)
		     else next() 
	     })
	}
	sendUserMail(data, tickets, next){
		let mailOptions={
	        to : data.mail,
	        from: 'tickets@fcastana.kz',
	        subject : "Astana Arena | Билеты на мероприятие",
	        html : `Здравствуйте.<br> Ваши купленные билеты доступны по следующей ссылке:<br><br>` 
	    }

	    let host = "92.46.109.122:8109";
        // let host = data.req.get('host');
        // if ( data.req.get('host') != 'localhost'){
        // 	host = host + ":8109";
        // }
	 

	    tickets.forEach((ticket, index) => {
	    	let hash = md5((ticket.ID + ticket.IDEvent + ticket.Barcode));
	    	console.log(ticket);
	    	console.log((ticket.ID + ticket.IDEvent + ticket.Barcode) + " | " + hash);
	    	let link =`http://${host}/cloud/ticket/A4/${ticket.ID}/${hash}`;
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