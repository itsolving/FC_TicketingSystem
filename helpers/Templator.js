let fs  	= require('fs'),
	pdf 	= require('html-pdf'),
	bwipjs  = require('bwip-js'),
	gm = require('gm').subClass({imageMagick: true});

class Templator{
	constructor(){
		this.replaceList = [
			'{{ticketID}}', 
			'{{eventName}}', 
			'{{ticketPrice}}', 
			'{{SectorName}}', 
			'{{RowN}}', 
			'{{SeatN}}', 
			'{{ticID}}', 
			'{{QRCode}}',
			'{{Barcode}}'
		]
	}


	// подставляет все переменные в шаблон
	template(file, newData){
		this.replaceList.forEach((item, i, array) => {
			file = file.replace(item, newData[i]);
		})
		return file;
	}


	// конверт из html в pdf
	htmlToPdf(ticket, fileData, next){
		let htmlLink = `${__dirname}/../${fileData.link}`;
		let templateName = fileData.name;

		var html = fs.readFileSync(htmlLink, 'utf8');
		var options = { 
			format: 'Letter'      
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
	            var Barcode = 'data:image/png;base64,' + BarcodeSrc.toString('base64');
	            var newHTML = this.template(html, [
					ticket.ID, 
					ticket.Name, 
					ticket.Price, 
					ticket.SectorName, 
					ticket.RowN, 
					ticket.SeatN, 
					ticket.ID, 
					ticket.Barcode.replace(/\s+/, ""),
					Barcode
				]);


				pdf.create(newHTML, options).toBuffer( (err, buffer) => {
				  next(buffer);
				});
	        }
	    });


	}
	example(fileData, next){
		let htmlLink = `${__dirname}/../${fileData.link}`;
		let templateName = fileData.name;

		var html = fs.readFileSync(htmlLink, 'utf8');
		var options = { 
			format: 'Letter'      
		};

		pdf.create(html, options).toBuffer( (err, buffer) => {
		    next(buffer);
		});
	}
}


module.exports = Templator;