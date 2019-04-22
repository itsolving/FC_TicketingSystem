let fs  		 = require('fs'),
	pdf 		 = require('html-pdf'),
	bwipjs  	 = require('bwip-js'),
	image2base64 = require('image-to-base64');
	gm 	    	 = require('gm').subClass({imageMagick: true}),
	forEach 	 = require('async-foreach').forEach;

class Templator{
	constructor(){
		this.replaceList = [
			'{{ticketID}}', 
			'{{eventName}}', 
			'{{ticketPrice}}', 
			'{{SectorName}}', 
			'{{RowN}}', 
			'{{SeatN}}',
			'{{Barcode}}',
			'{{DateFrom}}',
			'{{StadiumName}}',
			'{{CityName}}',
			'{{EventImage}}'
		]
	}


	// подставляет все переменные в шаблон
	template(file, newData){
		this.replaceList.forEach((item, i, array) => {
			file = file.replace(item, newData[item]);
		})
		return file;
	}

	multiTickets(tickets, fileData, next){
			let htmlLink = `${__dirname}/../${fileData.link}`;
			let templateName = fileData.name;
			var html = fs.readFileSync(htmlLink, 'utf8');
			var options = { 
				format: 'A4'      
			};
			let multiHTML = '';
			image2base64(`${__dirname}/../public${tickets[0].ImgPath}`) // you can also to use url
			    .then(async (response) => {
		        	let afisha = 'data:image/png;base64,';
		            afisha = afisha + response;
		            for ( let i = 0; i < tickets.length; i++ ){
					
						let options = { 
							bcid: "ean13", 
							text: tickets[i].Barcode, 
							scale: 3, 
							height: 10, 
							includetext: true, 
							textxalign: 'center',
							rotate: 'R'
						};
					    let reqAPI = "http://bwipjs-api.metafloor.com/?"
					    for(var attr in options) { 
					    	if ( attr == 'bcid'){
					    		reqAPI +=`${attr}=${options[attr]}`;
					    	}
					    	else {
						    	reqAPI += `&${attr}=${options[attr]}`;
						    } 
						}
			            let toReplace = {
			            	'{{ticketID}}': tickets[i].ID, 
							'{{eventName}}': tickets[i].Name,
							'{{ticketPrice}}': tickets[i].Price, 
							'{{SectorName}}': tickets[i].SectorName,
							'{{RowN}}': tickets[i].RowN,
							'{{SeatN}}': tickets[i].SeatN,
							'{{Barcode}}': reqAPI,
							'{{StadiumName}}': tickets[i].StadiumName,
							'{{CityName}}': tickets[i].CityName,
							'{{DateFrom}}': tickets[i].DateFrom,
							'{{EventImage}}': afisha
			            };
			            let newHTML = this.template(html, toReplace);	          
			            multiHTML = multiHTML + newHTML;
		            }
		            pdf.create(multiHTML, options).toBuffer( (err, buffer) => {
						next(buffer);
					});
		        }
		    )
		    .catch(
		        (error) => {
		            console.log(error); //Exepection error....
		        }
		    )
	}


	// конверт из html в pdf
	htmlToPdf(ticket, fileData, next){
		let htmlLink = `${__dirname}/../${fileData.link}`;
		let templateName = fileData.name;

		var html = fs.readFileSync(htmlLink, 'utf8');
		var options = { 
			format: 'A4'      
		};
		
        let afisha = 'data:image/png;base64,';
        image2base64(`${__dirname}/../public${ticket.ImgPath}`) 
		    .then(
		        (response) => {
		        	let options = { 
						bcid: "ean13", 
						text: ticket.Barcode, 
						scale: 3, 
						height: 10, 
						includetext: true, 
						textxalign: 'center' 
					};
				    let reqAPI = "http://bwipjs-api.metafloor.com/?"
				    for(var attr in options) { 
				    	if ( attr == 'bcid'){
				    		reqAPI +=`${attr}=${options[attr]}`;
				    	}
				    	else {
					    	reqAPI += `&${attr}=${options[attr]}`;
					    } 
					}
		            afisha = afisha + response;
		            let toReplace = {
		            	'{{ticketID}}': ticket.ID, 
						'{{eventName}}': ticket.Name,
						'{{ticketPrice}}': ticket.Price, 
						'{{SectorName}}': ticket.SectorName,
						'{{RowN}}': ticket.RowN,
						'{{SeatN}}': ticket.SeatN,
						'{{Barcode}}': reqAPI,
						'{{StadiumName}}': ticket.StadiumName,
						'{{CityName}}': ticket.CityName,
						'{{DateFrom}}': ticket.DateFrom,
						'{{EventImage}}': afisha
		            };
		            var newHTML = this.template(html, toReplace);

					pdf.create(newHTML, options).toBuffer( (err, buffer) => {
					  next(buffer);
					});
		        }
		    )
		    .catch(
		        (error) => {
		            console.log(error); //Exepection error....
		        }
		    )
		
	}
	example(fileData, next){
		let htmlLink = `${__dirname}/../${fileData.link}`;
		let templateName = fileData.name;

		var html = fs.readFileSync(htmlLink, 'utf8');

		let opt = { 
			bcid: "ean13", 
			text: 111111111111, 
			scale: 3, 
			height: 10, 
			includetext: true, 
			textxalign: 'center' 
		};
	    let reqAPI = "http://bwipjs-api.metafloor.com/?"
	    for(var attr in opt) { 
	    	if ( attr == 'bcid'){
	    		reqAPI +=`${attr}=${opt[attr]}`;
	    	}
	    	else {
		    	reqAPI += `&${attr}=${opt[attr]}`;
		    } 
		}
		var options = { 
			format: 'A4'      
		};
		let toReplace = {
			'{{ticketID}}': '{{ticketID}}', 
			'{{eventName}}': '{{eventName}}',
			'{{ticketPrice}}': '{{ticketPrice}}', 
			'{{SectorName}}': '{{SectorName}}',
			'{{RowN}}': '{{RowN}}',
			'{{SeatN}}': '{{SeatN}}',
			'{{Barcode}}': reqAPI,
			'{{StadiumName}}': '{{StadiumName}}',
			'{{CityName}}': '{{CityName}}',
			'{{DateFrom}}': '{{DateFrom}}',
			'{{EventImage}}': '{{EventImage}}'
        };
		var newHTML = this.template(html, toReplace);

		pdf.create(newHTML, options).toBuffer( (err, buffer) => {
		    next(buffer);
		});
	}
}


module.exports = Templator;