module.exports = (router, dbUtils, sAdminPageTitle) => {
	//для загрузки списка городов для отображения в выпадающем списке на вебстранице (вызываем в jquery)
	router.get('/citiesJson', function(req, res, next) {

		console.log("GET /admin/citiesjson");
		dbUtils.City.getNameID((cityList) => {
			res.json(cityList);
		})
		
	});
}