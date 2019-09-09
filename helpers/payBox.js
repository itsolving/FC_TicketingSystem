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
    }
    createPayment(data, next){
        let description = ``;
        data.tickets.forEach((item, index) => {
            if (index == data.tickets.length-1){
                description += `${item.Name} сектор ${item.SectorName} ряд ${item.RowN} место ${item.SeatN}`;
            }
            else description += `${item.Name} сектор ${item.SectorName} ряд ${item.RowN} место ${item.SeatN} - `;
        })
        let now = new Date();
        now.setHours(now.getHours() + 1);
        let options = {                 
            method: 'POST',             
            uri: 'https://api.paybox.money/v4/payments',
            json: {
                "amount": data.Price,
                "currency": 'KZT',
                "description": description,
                "expires_at": now
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
                            let obj = {
                                status:     info.status.code,
                                amount:     info.amount,
                                paymentid:  info.id,
                                created_at: info.created_at,
                                updated_at: info.updated_at
                            }
                            if ( info.user ){
                                obj.email = info.options.user.email;
                                obj.phone = info.options.user.phone;
                            }
                            dbUtils.Payment.changeData(obj, (answer) => {
                                if (info.status.code == 'success'){
                                    dbUtils.Ticket.multiStatus(item.Tickets.split(','), 5, (next) => {
                                        dbUtils.Ticket.customSelect(item.Tickets, (tickets) => {
                                            mailer.sendUserMail({mail: info.options.user.email}, tickets, () => {
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