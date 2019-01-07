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
	htmlToPdf(ticket, fileData, next){
		let htmlLink = `${__dirname}./../${fileData.link}`;
		let templateName = fileData.name;

		var html = fs.readFileSync(htmlLink, 'utf8');
		var options = { 
			format: 'Letter'      
		};

		var newHTML = this.template(html, [ticket.ID, ticket.Name, ticket.Price, ticket.SectorName, ticket.RowN, ticket.SeatN]);


		pdf.create(newHTML, options).toFile(`./tempFiles/${templateName}.pdf`, (err, res) => {
		  console.log(res);
		  next(res);
		});
	}
}


module.exports = Templator;