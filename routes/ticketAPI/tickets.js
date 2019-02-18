/* --------------------- СТАТУСЫ БИЛЕТОВ --------------------- */
/*

   ID | Name	   | Description
---------------------------------------------------------------
	1 |	Активный   |		
---------------------------------------------------------------
	2 |	Неактивный | Закрылся, приостановлена
---------------------------------------------------------------
	3 |	Свободный  | Билет продается
---------------------------------------------------------------
	4 |	Резерв	   |
---------------------------------------------------------------
	5 |	Продан	   |
---------------------------------------------------------------
	6 |	Удален	   | Билет удален 
---------------------------------------------------------------
	7 |	Заведен	   |
---------------------------------------------------------------
 */
/* ----------------------------------------------------------- */



module.exports = (router, dbUtils) => {

	router.get('/passage/:IDEvent/:Barcode', function(req, res){
		let reqData = {
			IDEvent: req.params.IDEvent, 
			Barcode: req.params.Barcode
		}
		let sessData = req.session;
		dbUtils.Ticket.getByBarcode(reqData, (ticket) => {
			if ( ticket ){
				dbUtils.Ticket.getPassage({ID: ticket.ID, Barcode: ticket.Barcode, IDEvent: ticket.IDEvent}, (result) => {
					if ( result.ID ){
						// проход уже был зафиксирован
						res.json({err: "проход уже зафиксирован"})
					}
					else {
						dbUtils.Ticket.insertPassage({IDTicket: ticket.ID, IDEvent: ticket.IDEvent, IDUserController: 1 /* TEST, ИСПРАВИТЬ */}, (data) => {
							if (data.ID){
								res.json({ok: "Проход успешен!"});
							}
							else res.json({err: "Ошибка прохода!"});
						})
					}
				})
			}
			else res.json({err: "билет не найден"})
		})
	})

	router.post('/passage/put/', function(req, res){
		let reqData = {
			IDEvent: req.body.idevent, 
			Barcode: req.body.barcode,
			type:    req.body.type
		}
		dbUtils.Ticket.getByBarcode(reqData, (ticket) => {
			if ( ticket ){
				dbUtils.Ticket.getPassage({ID: ticket.ID, Barcode: ticket.Barcode, IDEvent: ticket.IDEvent}, (result) => {
					if ( result.ID ){
						// проход уже был зафиксирован
						res.json({err: "проход уже зафиксирован"})
					}
					else {
						dbUtils.Ticket.insertPassage({IDTicket: ticket.ID, IDEvent: ticket.IDEvent, IDUserController: reqData.type}, (data) => {
							if (data.ID){
								res.json({ok: "Проход успешен!"});
							}
							else res.json({err: "Ошибка прохода!"});
						})
					}
				})
			}
			else res.json({err: "билет не найден"})
		})
	})
}