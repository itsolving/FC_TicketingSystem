let uuid    = require('uuid/v4'),
    request = require('request'),
    dbUtils = require(`${__basedir}/database/DatabaseUtils.js`),
    mailer  = require(`${__basedir}/helpers/mailer.js`); ; 

class payBox {
    constructor(){
        this.accessData = '516923:cfAya1QOyk6UJZuu';
        this.options = {
            "callbacks": {
                // "result_url": "string",
                // "check_url": "string",
                // "cancel_url": "string",
                "success_url": "string",
                // "failure_url": "string",
                // "back_url": "string",
                // "capture_url": "string"
            }
        }
        this.host = null;
        this.req = null;
    }
    setHost(req){
        this.req = req;
        let host = req.get('host');
        if ( req.get('host') != 'localhost'){
            host = host + ":8109";
        }
        this.host = host;
        this.options.callbacks['success_url'] = `http://${host}/ticketsale/success/{id}`;

    }
    createPayment(data, next){
        let options = {                 
            method: 'POST',             
            uri: 'https://api.paybox.money/v4/payments',
            json: {
                "amount": data.Price,
                "currency": 'KZT',
                "description": `Электронный билет на мероприятие`
            },                       
            headers: {               
                'Authorization': 'Basic ' + new Buffer(this.accessData).toString('base64'),
                'X-Idempotency-Key': uuid()           
            }
        };                                         
        request(options, (error, response, body) => {  
            console.log(body)
            next(body);
        });
    }
    getPaymentInfo(id, next){
        let options = {                 
            method: 'GET',             
            uri: `https://api.paybox.money/v4/payments/${id}`,                   
            headers: {               
                'Authorization': 'Basic ' + new Buffer(this.accessData).toString('base64'),
                'X-Idempotency-Key': uuid()           
            }
        };   
        request(options, (error, response, body) => {  
            next(body);
        }); 
    }

    analysis(){
        setInterval(() => {
            dbUtils.Payment.getNew((payments) => {
                if ( !payments.length ) return;
                payments.forEach((item) => {
                    this.getPaymentInfo(item.IDPayment, (info) => {
                        info = JSON.parse(info);
                        console.log(info);
                        if (info.status.code != 'new'){
                            dbUtils.Payment.changeData({
                                status:    info.status.code,
                                amount:    info.amount,
                                email:     info.options.user.email,
                                phone:     info.options.user.phone,
                                paymentid: info.id
                            }, (answer) => {
                                if (info.status.code == 'success'){
                                    dbUtils.Ticket.multiStatus(item.Tickets.split(','), 5, (next) => {
                                        dbUtils.Ticket.customSelect(item.Tickets, (tickets) => {
                                            mailer.sendUserMail({mail: info.options.user.email, req: this.req}, tickets, () => {
                                                // payment success, tickets go to user
                                                console.log(`payment success (id: ${info.id})`);
                                            })  
                                        })
                                    })
                                   
                                 
                                }
                            })
                        }
                    })
                })
            })
        }, 30 * 1000);
    }
}

let payBoxer = new payBox();

payBoxer.analysis();

// payBoxer.createPayment({Price: 550}, (response) => {
//     setTimeout(function() { payBoxer.getPaymentInfo(response.id, (info) => { console.log(info) }) }, 60000);
// })


module.exports = payBoxer;