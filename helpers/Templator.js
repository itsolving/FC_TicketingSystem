let fs  = require('fs'),
	pdf = require('html-pdf');


class Templator{
	constructor(){
		this.replaceList = [
			'{{ticketID}}', '{{eventName}}', '{{ticketPrice}}', '{{SectorName}}', '{{RowN}}', '{{SeatN}}'
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
	htmlToPdf(ticket, next){
		let htmlLink = `${__dirname}./../templates/Template1/index.html`;
		let templateName = 'Template1';

		var html = fs.readFileSync(htmlLink, 'utf8');
		var options = { 
			format: 'Letter'      
		};

		var newHTML = this.template(html, [ticket.ID, ticket.Name, ticket.Price, ticket.SectorName, ticket.RowN, ticket.SeatN]);


		pdf.create(newHTML, options).toFile(`./tempFiles/${templateName}.pdf`, (err, res) => {
		  console.log(res);
		  next(res);
		});

		/*pdf.create(newHTML, options).toBuffer((err, buffer) => {
			console.log(buffer)
		  	next(buffer);
		});*/
		 
		// return pdfLink; возвращает ссылку на pdf
	}
}


module.exports = Templator;