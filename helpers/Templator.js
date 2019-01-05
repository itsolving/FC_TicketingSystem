class Templator{
	constructor(){

	}


	// подставляет все переменные в шаблон
	template(){

		// return htmlLink; возвращает ссылку на новый сгенерированый документ
	}


	// конверт из html в pdf
	htmlToPdf(){
		let htmlLink = './../templates/Template1/index.html';
		let templateName = 'Template1';

		var fs = require('fs');
		var pdf = require('html-pdf');
		var html = fs.readFileSync(htmlLink, 'utf8');
		var options = { 
			format: 'Letter'      
		};
		 
		pdf.create(html, options).toFile(`./${templateName}.pdf`, function(err, res) {
		  if (err) return console.log(err);
		  console.log(res); // { filename: '/app/businesscard.pdf' }
		});
		// return pdfLink; возвращает ссылку на pdf
	}
}

let tmp = new Templator();
tmp.htmlToPdf();


//module.exports = Templator;