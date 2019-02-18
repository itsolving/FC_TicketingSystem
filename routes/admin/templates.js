let fileUploader = require(`${__basedir}/helpers/fileUploader.js`),
	Templator 	 = require(`${__basedir}/helpers/Templator.js`),
	templator 	 = new Templator(),
	fs           = require('fs');


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
	router.get('/get/template/:id', function(req, res){
		let sAdminLogin = "",
			sessData 	= req.session;


		console.log("POST /get/template/:id");
		if(sessData.admControl){
	        sAdminLogin = sessData.admControl.Login;
        }
		else {
			res.redirect('/admin');
			return;
		}


		let	templateID = req.params.id;
		dbUtils.Template.getByID(templateID, (template) => {
			templator.example({ name: template.templateName, link: `${template.templateUrl}/${template.fileName}` }, (pdfData) => {
				res.type('pdf'); 
				res.send(pdfData);
			})
		})
		
	})

	// /admin/edit/template/:id
	router.get('/edit/template/:id', function(req, res){
		let sAdminLogin = "",
			sessData 	= req.session;


		console.log("GET /admin/edit/template/:id");
		if(sessData.admControl){
	        sAdminLogin = sessData.admControl.Login;
        }
		else {
			res.redirect('/admin');
			return;
		}


		let	templateID = req.params.id;
		
		if (!(parseInt(templateID))){
			res.satus('404')
			return;
		}

		dbUtils.Template.getByID(templateID, (template) => {
			if ( template.templateName ){
				fs.readFile(`${__dirname}/../../${template.templateUrl}/${template.fileName}`, function read(err, data) {
				    if (err) {
				        throw err;
				    }
				    content = data;

				    res.render('adminTemplateEdit', {title: sAdminPageTitle, adminLogin: sAdminLogin, fileContent: content, IDTemplate: templateID})
				});

			} 
			else res.json({err: 'template is not found'})
		})
		
	})

	// /admin/edit/template/:id
	router.post('/edit/template/:id', function(req, res){
		let sAdminLogin = "",
			sessData 	= req.session;


		console.log("POST /admin/edit/template/:id");
		if(sessData.admControl){
	        sAdminLogin = sessData.admControl.Login;
        }
		else {
			res.redirect('/admin');
			return;
		}
		console.log(typeof(req.params.id))

		let data = {
			templateID: req.params.id,
			content: req.body.content
		}
		dbUtils.Template.getByID(data.templateID, (template) => {
			if ( template.templateName ){
				fs.writeFile(`${__dirname}/../../${template.templateUrl}/${template.fileName}`, data.content, (err) => {  
				    if (err){
				    	res.json({err: "Произошла ошибка, попробуйте еще раз!"})
				    } else {
				    	res.json({success: true})
				    }
				    
				});
	

			} 
			else res.json({err: 'template is not found'})
		})
		
	})
}