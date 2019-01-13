let fileUploader = require(`${__basedir}/helpers/fileUploader.js`),
	Templator 	 = require(`${__basedir}/helpers/Templator.js`),
	templator 	 = new Templator();


module.exports = (router, dbUtils, sAdminPageTitle) => {

	// страница /admin/templates
	router.get('/templates', function(req, res){
		let sAdminLogin = "",
			sessData 	= req.session;


		console.log("GET /admin/templates");
		if(sessData.admControl){
	        sAdminLogin = sessData.admControl.Login;
        }
		else {
			res.redirect('/admin');
			return;
		}

		dbUtils.Template.getAll((templates) => {
			res.render('adminTemplates', {title: sAdminPageTitle, adminLogin: sAdminLogin, templates: templates});
		})

	})


	// страница /admin/template/:ID
	router.get('/template/:id', function(req, res){
		let sAdminLogin = "",
			sessData 	= req.session;


		console.log("GET /admin/templates");
		if(sessData.admControl){
	        sAdminLogin = sessData.admControl.Login;
        }
		else {
			res.redirect('/admin');
			return;
		}

		// разработка	!!!!!!!!!!!!

		let nID = req.params.id;

		dbUtils.Template.getByID(nID, (template) => {
			res.json(template);
		})

	})

	router.post('/templates', function(req, res){
		let sAdminLogin = "",
			sessData 	= req.session;


		console.log("POST /admin/templates");
		if(sessData.admControl){
	        sAdminLogin = sessData.admControl.Login;
        }
		else {
			res.redirect('/admin');
			return;
		}

		let filesURL = `../../templates/${req.body.name}`;
		 	dbURL 	 = `templates/${req.body.name}`;

		fileUploader(req.files, filesURL);
		dbUtils.Template.insert({ templateName: req.body.name,fileURL: dbURL, fileName: req.files.page.name }, (ans) => {
			res.redirect('/admin/templates');
		})

	})


	// /admin/tmp/download/5/5348 или /admin/tmp/download/4/5348 для теста
	router.get('/tmp/download/:templateID/:ticketID', function(req, res){
		let data = {
			ticketID: req.params.ticketID,
			templateID: req.params.templateID
		}
		dbUtils.Ticket.getByID(data.ticketID, (ticket) => {
			dbUtils.Template.getByID(data.templateID, (template) => {
				templator.htmlToPdf(ticket, { name: template.templateName, link: `${template.templateUrl}/${template.fileName}` }, (file) => {
					res.sendFile(file.filename);
				});
			})
		})
	})
}