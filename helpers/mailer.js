let nodemailer = require('nodemailer'),
	md5 	   = require('md5'),
	 dbUtils   = require(`${__basedir}/database/DatabaseUtils.js`);

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
		console.log(tickets);
		let mailOptions={
	        to : data.mail,
	        from: 'tickets@fcastana.kz',
	        subject : `${tickets[0].Name} | Билеты на мероприятие`,
	        html : `Здравствуйте.<br> Ваши купленные билеты доступны по следующей ссылке:<br><br>`,
	        attachments: []
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

	    mailOptions.attachments.push({
	    	filename: 'tickets.pdf',
        	path: link
	    })

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
	        subject : `${tickets[0].Name} | Билеты на мероприятие`,
	        html : `Здравствуйте.<br> Вы купили ${tickets.length} билет(ов). Номер заказа: ${data.paymentId}<br> Ваши купленные билеты доступны по следующей ссылке:<br><br>`,
	        attachments: []
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
	    	mailOptions.attachments.push({
		    	filename: `Ticket_${index+1}.pdf`,
	        	path: link
		    })
	    })
	    this.smtp.sendMail(mailOptions, (error, response) => {
		    if(error){
		    	console.log(error);
		  	}
			else { 
				console.log(response);
				dbUtils.Payment.changeReceived('true', data.paymentId, (receivedAns) => {
                    console.log(receivedAns);
                    console.log(`Email received success: ${data.mail}`)
                    next(true); 
                })	
			}
	     })
	}
	sendFromGmail(data, tickets, next){
		let smtp = nodemailer.createTransport({		 		
 		    service: "Gmail",		 			
 		    auth: {		 		   
 		        user: "ticketscloud.astana",		 		   
 		        pass: "f5a175acac4a00aa702424d53b01903a"		 		    
 		    }
 		});
		console.log(tickets);
		let mailOptions={
	        to : data.mail,
	        from: 'ticketscloud.astana@gmail.com',
	        subject : `${tickets[0].Name} | Билеты на мероприятие`,
	        html : `Здравствуйте.<br> Ваши купленные билеты доступны по следующей ссылке:<br><br>`,
	        attachments: []
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

	    mailOptions.attachments.push({
	    	filename: 'tickets.pdf',
        	path: link
	    })

	    mailOptions.html = mailOptions.html + `<a href="${link}">Билеты</a><br>`;

	    smtp.sendMail(mailOptions, (error, response) => {
		     if(error) console.log(error)
		     else next() 
	     })
	}

}

let Verification = new eMailVerification();

module.exports = Verification;