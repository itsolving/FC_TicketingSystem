module.exports = (router, dbUtils, sAdminPageTitle) => {
	//для загрузки списка городов для отображения в выпадающем списке на вебстранице (вызываем в jquery)
	router.get('/rolesJson', function(req, res, next) {
		console.log("GET /rolesjson");
		dbUtils.Role.getNameID((roleList) => {
			res.json(roleList);
		})
	});
}