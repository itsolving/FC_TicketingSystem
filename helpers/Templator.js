let fs  	= require('fs'),
	pdf 	= require('html-pdf'),
	bwipjs  = require('bwip-js'),
	barcode = require('barcode'),
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
		let htmlLink = `${__dirname}./../${fileData.link}`;
		let templateName = fileData.name;

		var html = fs.readFileSync(htmlLink, 'utf8');
		var options = { 
			format: 'Letter'      
		};
		console.log(gm)

		ticket.Barcode = ticket.Barcode.replace(/\s/g, '');			// удалить пробелы в строке

		console.log("Template ticket");
		console.log(ticket)
		var coder = barcode('ean13', {
		    data: 'qwertyuiopasd',
		    width: 400,
		    height: 100,
		});

		/*coder.getBase64( (err, BarcodeSrc) => {
		    if (err) throw err;
		 
		    // if we're using HTTP or another framework
		    
		    var newHTML = this.template(html, [
				ticket.ID, 
				ticket.Name, 
				ticket.Price, 
				ticket.SectorName, 
				ticket.RowN, 
				ticket.SeatN, 
				ticket.ID, 
				ticket.Barcode.replace(/\s+/, ""),
				BarcodeSrc
			]);


			pdf.create(newHTML, options).toFile(`./tempFiles/${templateName}.pdf`, (err, res) => {
			  console.log(res);
			  next(res);
			});
		});*/
	
		bwipjs.toBuffer({
	        bcid:        'ean13',       // Barcode type
	        text:        ticket.Barcode.replace(/\s+/, ""),    // Text to encode
	        scale:       3,               // 3x scaling factor
	        height:      10,              // Bar height, in millimeters
	        includetext: true,            // Show human-readable text
	        textxalign:  'center',        // Always good to set this
	    }, (err, BarcodeSrc) => {
	        if (err) {
	        	console.log(err)
	            // Decide how to handle the error
	            // `err` may be a string or Error object
	        } else {
	            // `png` is a Buffer
	            // png.length           : PNG file length
	            // png.readUInt32BE(16) : PNG image width
	            // png.readUInt32BE(20) : PNG image height
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


				pdf.create(newHTML, options).toFile(`./tempFiles/${templateName}.pdf`, (err, res) => {
				  console.log(res);
				  next(res);
				});
	        }
	    });


	}
}


module.exports = Templator;