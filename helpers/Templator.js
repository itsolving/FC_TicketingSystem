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
			    .then((response) => {
			    		function final(){
			    			pdf.create(multiHTML, options).toBuffer( (err, buffer) => {
							  next(buffer);
							});
			    		}
			        	let afisha = 'data:image/png;base64,';
			            afisha = afisha + response;
			            forEach(tickets, (ticket) => {
							bwipjs.toBuffer({
						        bcid:        "ean13",       // Barcode type
						        text:        ticket.Barcode,    // Text to encode
						        scale:       3,               // 3x scaling factor
						        height:      10,              // Bar height, in millimeters
						        includetext: true,            // Show human-readable text
						        textxalign:  'center',        // Always good to set this
						    }, (err, BarcodeSrc) => {
						        if (err) {
						        	console.log(err)
						        } else {
						            let Barcode = 'data:image/png;base64,' + BarcodeSrc.toString('base64');
						      
						            let toReplace = {
						            	'{{ticketID}}': ticket.ID, 
										'{{eventName}}': ticket.Name,
										'{{ticketPrice}}': ticket.Price, 
										'{{SectorName}}': ticket.SectorName,
										'{{RowN}}': ticket.RowN,
										'{{SeatN}}': ticket.SeatN,
										'{{Barcode}}': Barcode,
										'{{StadiumName}}': ticket.StadiumName,
										'{{CityName}}': ticket.CityName,
										'{{DateFrom}}': ticket.DateFrom,
										'{{EventImage}}': afisha
						            };
						            var newHTML = this.template(html, toReplace);

						            multiHTML = multiHTML + newHTML;
									/*pdf.create(newHTML, options).toBuffer( (err, buffer) => {
									  next(buffer);
									});*/
									      
	
						      
						        }
						    });
						}, final)
			         	
			        }
			    )
			    .catch(
			        (error) => {
			            console.log(error); //Exepection error....
			        }
			    )
			/*tickets.forEach((ticket) => {
				bwipjs.toBuffer({
			        bcid:        "ean13",       // Barcode type
			        text:        ticket.Barcode,    // Text to encode
			        scale:       3,               // 3x scaling factor
			        height:      10,              // Bar height, in millimeters
			        includetext: true,            // Show human-readable text
			        textxalign:  'center',        // Always good to set this
			    }, (err, BarcodeSrc) => {
			        if (err) {
			        	console.log(err)
			        } else {
			            let Barcode = 'data:image/png;base64,' + BarcodeSrc.toString('base64');
			            let afisha = 'data:image/png;base64,';
			            image2base64(`${__dirname}/../public${ticket.ImgPath}`) // you can also to use url
						    .then(
						        (response) => {
						            afisha = afisha + response;
						            let toReplace = {
						            	'{{ticketID}}': ticket.ID, 
										'{{eventName}}': ticket.Name,
										'{{ticketPrice}}': ticket.Price, 
										'{{SectorName}}': ticket.SectorName,
										'{{RowN}}': ticket.RowN,
										'{{SeatN}}': ticket.SeatN,
										'{{Barcode}}': Barcode,
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
			    });
			})*/
	}


	// конверт из html в pdf
	htmlToPdf(ticket, fileData, next){
		let htmlLink = `${__dirname}/../${fileData.link}`;
		let templateName = fileData.name;

		var html = fs.readFileSync(htmlLink, 'utf8');
		var options = { 
			format: 'A4'      
		};
		console.log(ticket)
		//ticket.Barcode = ticket.Barcode.replace(/\s/g, '');			// удалить пробелы в строке
		console.log(ticket.Barcode);

		bwipjs.toBuffer({
	        bcid:        "ean13",       // Barcode type
	        text:        ticket.Barcode,    // Text to encode
	        scale:       3,               // 3x scaling factor
	        height:      10,              // Bar height, in millimeters
	        includetext: true,            // Show human-readable text
	        textxalign:  'center',        // Always good to set this
	    }, (err, BarcodeSrc) => {
	        if (err) {
	        	console.log(err)
	        } else {
	            let Barcode = 'data:image/png;base64,' + BarcodeSrc.toString('base64');
	            let afisha = 'data:image/png;base64,';
	            image2base64(`${__dirname}/../public${ticket.ImgPath}`) // you can also to use url
				    .then(
				        (response) => {
				            afisha = afisha + response;
				            let toReplace = {
				            	'{{ticketID}}': ticket.ID, 
								'{{eventName}}': ticket.Name,
								'{{ticketPrice}}': ticket.Price, 
								'{{SectorName}}': ticket.SectorName,
								'{{RowN}}': ticket.RowN,
								'{{SeatN}}': ticket.SeatN,
								'{{Barcode}}': Barcode,
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
	    });


	}
	example(fileData, next){
		let htmlLink = `${__dirname}/../${fileData.link}`;
		let templateName = fileData.name;

		var html = fs.readFileSync(htmlLink, 'utf8');
		var options = { 
			format: 'A4'      
		};

		pdf.create(html, options).toBuffer( (err, buffer) => {
		    next(buffer);
		});
	}
}


module.exports = Templator;