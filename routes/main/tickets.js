let bwipjs = require('bwip-js');


module.exports = (router, db) => {
	
	//эта функция не используется, создавалась для вебстраницы со схемой зала
	router.get('/gettickets/:idevent', function(req, res){
		console.log('get /gettickets/idevent');
		var eventID = req.params.idevent;
		console.log('eventID='+eventID);

		if (eventID !== 'undefined') {
			sSQL = `select row_to_json(t)
					from (
						select sectors."SectorName", sectors."SectorRu", sectors."minPrice", sectors."maxPrice", sectors."seatsLeft",
							(
								select array_to_json(array_agg(row_to_json(rw)))
								from
								(
									select row_all."RowN",
										(
											select array_to_json(array_agg(row_to_json(tick)))
											from
											(
												select tick_all."IDSeat", tick_all."SeatN", tick_all."RowN", tick_all."SectorName", tick_all."SectorRu", tick_all."Tribune", tick_all."TicketID", tick_all."Barcode", tick_all."Price", tick_all."IDStatus", tick_all."StatusName"
												from (
													SELECT t."ID" as "TicketID",
														trim(t."Barcode") "Barcode", t."Price"::numeric "Price",
														t."IDStatus", st."Name" "StatusName",
														t."IDSeat", s."SeatN", s."RowN",
														trim(s."SectorName") "SectorName", trim(s."SectorRu") "SectorRu", s."Tribune"
													FROM public."tTicket" t
													join public."tSeat" s on s."ID" = t."IDSeat" and s."IDRowN" = row_all."IDRowN"
													join public."tStatus" st on st."ID" = t."IDStatus"
													where 1=1
													and t."IDEvent" = 1
													and t."IDStatus" in (3, 4, 5)
												) tick_all
												where 1=1
												and tick_all."SectorName" = sectors."SectorName"
												and tick_all."RowN" = row_all."RowN"
												order by tick_all."SectorName", tick_all."RowN", tick_all."SeatN"
											) tick
										) as "tickets"
									from
									(
										SELECT r."ID" as "IDRowN", r."RowN", r."IDSector"
										FROM public."tRowN" r
										where 1=1
										and r."IDSector" = sectors."IDSector"
									) row_all
									where row_all."IDSector" = sectors."IDSector"
									order by row_all."RowN"
								) rw
							) as "sector_rows"
						from (
								SELECT tr."ID" as "IDTribune", Sc."ID" as "IDSector", sc."SectorName", sc."SectorRu",
									public."fGetMinPrice"(ev."ID", sc."SectorName") "minPrice",
									public."fGetMaxPrice"(ev."ID", sc."SectorName") "maxPrice",
									public."fGetSaleSeatCount"(ev."ID", sc."SectorName") "seatsLeft"
								FROM public."tEvent" ev
								join public."tTribune" tr on tr."IDStadium" = ev."IDStadium"
								join public."tSector" sc on sc."IDTribune" = tr."ID"
								where 1=1
								and ev."ID" = `+eventID+`
							) sectors
						where 1=1
						order by sectors."SectorName"
					) t `;

			//console.log(sSQL);
			db.db.any(sSQL)
				.then(function(data){
					if (data.length > 0) {
						console.log('tickets found:');
						res.status(200)
							.json({
								ReqStatus: 'success',
								Message: 'tickets found',
								TicketData: data
							});
					} else {
						console.log('tickets not found:');
						res.status(500)
							.json({
								ReqStatus: 'error',
								Message: 'tickets not found',
								TicketData: data
							});

					}
				})
				.catch(function(err){
					//return next(err);
					console.log('error of tickets-sql');
					console.log(err);
					res.status(err.status)
						.json({
							ReqStatus: 'error',
							Message: 'tickets not found',
							TicketData: {}
						});
				});
		}
		else {
			res.status(404)
				.json({
					ReqStatus: 'error',
					Message: 'event not found, so no tickets',
					TicketData: {}
				});
		}
	});

	//получение всех билетов по указанному мероприятию, используется в схеме зала
	router.post('/gettickets', function(req, res){
		console.log('post /gettickets');
		var eventID = req.body.IDEvent;
		console.log('eventID='+eventID);

		if (eventID !== 'undefined') {
			sSQL = `select row_to_json(t)
					from (
						select sectors."SectorName", sectors."SectorRu", sectors."minPrice", sectors."maxPrice", sectors."seatsLeft",
							(
								select array_to_json(array_agg(row_to_json(rw)))
								from
								(
									select row_all."RowN",
										(
											select array_to_json(array_agg(row_to_json(tick)))
											from
											(
												select tick_all."IDSeat", tick_all."SeatN", tick_all."RowN", tick_all."SectorName", tick_all."SectorRu", tick_all."Tribune", tick_all."TicketID", tick_all."Barcode", tick_all."Price", tick_all."IDStatus", tick_all."StatusName"
												from (
													SELECT t."ID" as "TicketID",
														trim(t."Barcode") "Barcode", t."Price"::numeric "Price",
														t."IDStatus", st."Name" "StatusName",
														t."IDSeat", s."SeatN", s."RowN",
														trim(s."SectorName") "SectorName", trim(s."SectorRu") "SectorRu", s."Tribune"
													FROM public."tTicket" t
													join public."tSeat" s on s."ID" = t."IDSeat" and s."IDRowN" = row_all."IDRowN"
													join public."tStatus" st on st."ID" = t."IDStatus"
													where 1=1
													and t."IDEvent" = 1
													and t."IDStatus" in (3, 4, 5)
												) tick_all
												where 1=1
												and tick_all."SectorName" = sectors."SectorName"
												and tick_all."RowN" = row_all."RowN"
												order by tick_all."SectorName", tick_all."RowN", tick_all."SeatN"
											) tick
										) as "tickets"
									from
									(
										SELECT r."ID" as "IDRowN", r."RowN", r."IDSector"
										FROM public."tRowN" r
										where 1=1
										and r."IDSector" = sectors."IDSector"
									) row_all
									where row_all."IDSector" = sectors."IDSector"
									order by row_all."RowN"
								) rw
							) as "sector_rows"
						from (
								SELECT tr."ID" as "IDTribune", Sc."ID" as "IDSector", sc."SectorName", sc."SectorRu",
									public."fGetMinPrice"(ev."ID", sc."SectorName") "minPrice",
									public."fGetMaxPrice"(ev."ID", sc."SectorName") "maxPrice",
									public."fGetSaleSeatCount"(ev."ID", sc."SectorName") "seatsLeft"
								FROM public."tEvent" ev
								join public."tTribune" tr on tr."IDStadium" = ev."IDStadium"
								join public."tSector" sc on sc."IDTribune" = tr."ID"
								where 1=1
								and ev."ID" = `+eventID+`
							) sectors
						where 1=1
						order by sectors."SectorName"
					) t `;
					
			//console.log(sSQL);
			db.db.any(sSQL)
				.then(function(data){
					if (data.length > 0) {
						console.log('tickets found:');
						res.status(200)
							.json({
								ReqStatus: 'success',
								Message: 'tickets found',
								TicketData: data
							});
					}
					else {
						console.log('no tickets');
						res.status(500)
							.json({
								ReqStatus: 'error',
								Message: 'tickets not found',
								TicketData: data
							});
					}
				})
				.catch(function(err){
					//return next(err);
					console.log('error of search actual tickets:');
					console.log(err);
					res.status(err.status)
						.json({
							ReqStatus: 'error',
							Message: 'tickets not found',
							TicketData: {}
						});
				});
		}
		else {
			res.status(404)
				.json({
					ReqStatus: 'error',
					Message: 'event not found, so no tickets',
					TicketData: {}
				});
		}
	});



	//получение билетов по указанному мероприятию, используется в схеме зала
	router.post('/getsectortickets', function(req, res){
	//получение json-списка билетов по указанному сектору
		console.log('post /getsectortickets');
		var eventID = req.body.IDEvent;
		var sectorName = req.body.SectorName;
		console.log('eventID='+eventID);
		console.log('sectorName='+sectorName);

		if (eventID !== 'undefined') {
			//проверим два варианта sql-запроса, какой из них быстрее
			//вариант 2
			sSQL = `select row_to_json(t)
					from (
						select sectors."SectorName", sectors."SectorRu", sectors."minPrice", sectors."maxPrice", sectors."seatsLeft",
							(
								select array_to_json(array_agg(row_to_json(rw)))
								from
								(
									select row_all."RowN",
										(
											select array_to_json(array_agg(row_to_json(tick)))
											from
											(
												select tick_all."IDSeat", tick_all."SeatN", tick_all."RowN", tick_all."SectorName", tick_all."SectorRu", tick_all."Tribune", tick_all."TicketID", tick_all."Barcode", tick_all."Price", tick_all."IDStatus", tick_all."StatusName"
												from (
													SELECT t."ID" as "TicketID",
														trim(t."Barcode") "Barcode", t."Price"::numeric "Price",
														t."IDStatus", st."Name" "StatusName",
														t."IDSeat", s."SeatN", s."RowN",
														trim(s."SectorName") "SectorName", trim(s."SectorRu") "SectorRu", s."Tribune"
													FROM public."tTicket" t
													join public."tSeat" s on s."ID" = t."IDSeat" and s."IDRowN" = row_all."IDRowN"
													join public."tStatus" st on st."ID" = t."IDStatus"
													where 1=1
													and t."IDEvent" = 1
													and t."IDStatus" in (3, 4, 5)
												) tick_all
												where 1=1
												and tick_all."SectorName" = sectors."SectorName"
												and tick_all."RowN" = row_all."RowN"
												order by tick_all."SectorName", tick_all."RowN", tick_all."SeatN"
											) tick
										) as "tickets"
									from
									(
										SELECT r."ID" as "IDRowN", r."RowN", r."IDSector"
										FROM public."tRowN" r
										where 1=1
										and r."IDSector" = sectors."IDSector"
									) row_all
									where row_all."IDSector" = sectors."IDSector"
									order by row_all."RowN"
								) rw
							) as "sector_rows"
						from (
								SELECT tr."ID" as "IDTribune", Sc."ID" as "IDSector", sc."SectorName", sc."SectorRu",
									public."fGetMinPrice"(ev."ID", sc."SectorName") "minPrice",
									public."fGetMaxPrice"(ev."ID", sc."SectorName") "maxPrice",
									public."fGetSaleSeatCount"(ev."ID", sc."SectorName") "seatsLeft"
								FROM public."tEvent" ev
								join public."tTribune" tr on tr."IDStadium" = ev."IDStadium"
								join public."tSector" sc on sc."IDTribune" = tr."ID"
								where 1=1
								and ev."ID" = `+eventID+`
								and upper(trim(sc."SectorName")) = upper('`+sectorName+`')
							) sectors
						where 1=1
						order by sectors."SectorName"
					) t `;
					////вариант 1
					/*'select row_to_json(t) '
					+'from ( '
					+'	select sectors."SectorName", sectors."SectorRu", sectors."minPrice", sectors."maxPrice", sectors."seatsLeft", '
					+'		( '
					+'			select array_to_json(array_agg(row_to_json(rw))) '
					+'			from '
					+'			( '
					+'				select row_all."RowN", '
					+'					( '
					+'						select array_to_json(array_agg(row_to_json(tick))) '
					+'						from '
					+'						( '
					+'							select tick_all."IDSeat", tick_all."SeatN", tick_all."RowN", tick_all."SectorName", tick_all."SectorRu", tick_all."Tribune", tick_all."TicketID", tick_all."Barcode", tick_all."Price", tick_all."IDStatus", tick_all."StatusName" '
					+'							from ( '
					+'								SELECT t."Barcode", t."ID" as "TicketID", t."IDSeat", '
					+'									s."SeatN", s."RowN", '
					+'									t."Price"::numeric "Price", '
					+'									t."IDStatus", st."Name" "StatusName", '
					+'									s."Tribune", trim(s."SectorName") "SectorName", trim(s."SectorRu") "SectorRu" '
					+'								FROM public."tTicket" t '
					+'								join public."tSeat" s on t."IDSeat" = s."ID" and upper(trim(s."SectorName")) = upper(\''+sectorName+'\') '
					+'								join public."tStatus" st on t."IDStatus" = st."ID" '
					+'								where t."IDEvent" = '+eventID+' '
					+'								and t."IDStatus" in (3, 4, 5) '
					+'							) tick_all '
					+'							where tick_all."SectorName" = sectors."SectorName" and tick_all."RowN" = row_all."RowN" '
					+'							order by tick_all."SectorName", tick_all."RowN", tick_all."SeatN" '
					+'						) tick '
					+'					) as "tickets" '
					+'				from '
					+'				( '
					+'					SELECT s."RowN", s."Tribune", trim(s."SectorName") "SectorName", trim(s."SectorRu") "SectorRu" '
					+'					FROM public."tSeat" s '
					+'					where upper(trim(s."SectorName")) = upper(\''+sectorName+'\') '
					+'					group by s."RowN", s."Tribune", trim(s."SectorName"), trim(s."SectorRu") '
					+'				) row_all '
					+'				where row_all."SectorName" = sectors."SectorName" '
					+'				order by row_all."RowN" '
					+'			) rw '
					+'		) as "sector_rows" '
					+'	from ( '
					+'			SELECT trim(s."SectorName") "SectorName", trim(s."SectorRu") "SectorRu", '
					+'				min(t."Price"::numeric) "minPrice", '
					+'				max(t."Price"::numeric) "maxPrice", '
					+'				count(case when t."IDStatus" = 3 then t."Price"::numeric end) "seatsLeft" '
					+'			FROM public."tTicket" t '
					+'			join public."tSeat" s on t."IDSeat" = s."ID" and upper(trim(s."SectorName")) = upper(\''+sectorName+'\') '
					+'			where t."IDEvent" = '+eventID+' '
					+'			and t."IDStatus" in (3, 4, 5) '
					+'			group by trim(s."SectorName"), trim(s."SectorRu") '
					+'		) sectors '
					+'	where 1=1 '
					+'  order by sectors."SectorName" '
					+') t ';*/
			//console.log(sSQL);
			db.db.any(sSQL)
				.then(function(data){
					console.log('tickets-sql finished success, eventID='+eventID+', sectorName='+sectorName);
					//console.log(data);
					if (data.length > 0) {
						console.log('tickets>0, eventID='+eventID+', sectorName='+sectorName);
						res.status(200)
							.json({
								ReqStatus: 'success',
								Message: 'tickets found',
								TicketData: data
							});
					}
					else {
						console.log('no tickets, eventID='+eventID+', sectorName='+sectorName);
						res.status(500)
							.json({
								ReqStatus: 'error',
								Message: 'tickets not found',
								TicketData: data
							});
					}
				})
				.catch(function(err){
					//return next(err);
					console.log('error of tickets-sql, eventID='+eventID+', sectorName='+sectorName);
					console.log(err);
					res.status(err.status)
						.json({
							ReqStatus: 'error',
							Message: 'tickets not found',
							TicketData: {}
						});
				});
		}
		else {
			console.log('eventID is undefined!');
			res.status(404)
				.json({
					ReqStatus: 'error',
					Message: 'event not found, so no tickets',
					TicketData: {}
				});
		}
	});

	// НЕ ИСПОЛЬЗУЕТСЯ - сохранение факта продажи билетов из схемы зала по указанному мероприятию
	router.post('/sendsaledtickets', function(req, res){
		console.log('post /sendsaledtickets');
		
		//данные из сессии
		var sLogin = "";
		var nUserID = 0;
		var events = {};
		var sessData = req.session;
		if(sessData.userLogin){
			sLogin = sessData.userLogin;
			nUserID = sessData.userID;
			events = sessData.eventsList;
		}
		
		var eventID = req.body.IDEvent;
		var sectorName = req.body.SectorName;
		var checkedSeats = req.body.CheckedSeats;
		
		var ticketsList = {};
		var sSQL = "";
		var sSQLTrans = "";
		var sSQLTickets = "";
		
		console.log('eventID='+eventID+', sectorName='+sectorName);
		console.log(checkedSeats);
		
		if (eventID !== 'undefined') {
			sSQL = "";
			checkedSeats.forEach(function(seat) {
				var rowN = seat.RowN;
				var seatN = seat.SeatN;
				var seatPrice = seat.Price;
				var sUpdate = 'update public."tTicket" set "IDStatus" = 5 where "IDSeat" in (select s."ID" from public."tSeat" s where s."SectorName" = \''+sectorName+'\' and s."RowN" = '+rowN+' and s."SeatN" = '+seatN+') and "IDEvent" = '+nEventID+';';
				sSQL = sSQL + sUpdate;
			});
			
			//console.log(sSQL);
			db.db.any(sSQL)
				.then(function(){
					//console.log('ticketsList: '+ JSON.stringify(data));
					console.log('saled tickets statuses updated');
					
					sSQLTickets = 'select "ID", "IDStatus", "IDSeat", "IDEvent" from public."tTicket" where "IDStatus" = 5 and "IDSeat" in (select s."ID" from public."tSeat" s where s."SectorName" = \''+sectorName+'\' and s."RowN" = '+rowN+' and s."SeatN" = '+seatN+') and "IDEvent" = '+nEventID+';';
					db.db.any(sSQLTickets)
						.then(function(tickets){
							sSQLTrans = "";
							tickets.forEach(function(tick) {
								var ticketID = tick.ID;
								
								// TODO: how to get value of idticket?
								var sTransInsert = 'insert into public."tTrans" ( "IDTicket", "Saledate", "IDUserSaler" ) values '
													+'( '+ticketID+', now(), '+nUserID+' ); ';
								sSQLTrans = sSQLTrans + sTransInsert;
							});
							db.db.any(sSQLTrans)
								.then(function(){
									console.log('transactions inserted');
									res.status(200)
										.json({
											ReqStatus: 'success',
											Message: 'saled tickets saved and transactions created'
										});
								})
								.catch(function(errInsTr){
									console.log('error of insert transactions of saled tickets:');
									console.log(errInsTr);
									res.status(errInsTr.status)
										.json({
											ReqStatus: 'error',
											Message: 'cannot create transactions for saled tickets, event '+nEventID
										});
								});
						})
						.catch(function(errSrchTick){
							console.log('error of search saled tickets:');
							console.log(errSrchTick);
							res.status(errSrchTick.status)
								.json({
									ReqStatus: 'error',
									Message: 'cannot find saled tickets for event '+nEventID
								});
						});
					
					
					
				})
				.catch(function(err){
					//return next(err);
					console.log('error of update saled tickets:');
					console.log(err);
					res.status(err.status)
						.json({
							ReqStatus: 'error',
							Message: 'saling tickets not saved'
						});
				});
		}
		else {
			res.status(404)
				.json({
					ReqStatus: 'error',
					Message: 'event not found, so no tickets updated'
				});
		}
	});
	// НЕ ИСПОЛЬЗУЕТСЯ - версия2 - сохранение факта продажи билетов из схемы зала по указанному мероприятию
	router.post('/sendsaledtickets2', function(req, res){
		console.log('post /sendsaledtickets2');
		
		//данные из сессии
		var sLogin = "";
		var nUserID = 0;
		var events = {};
		var sessData = req.session;
		if(sessData.userLogin){
			sLogin = sessData.userLogin;
			nUserID = sessData.userID;
			events = sessData.eventsList;
		}
		
		var seats = req.body.Seats;
		/*var eventID = req.body.IDEvent;
		var sectorName = req.body.SectorName;
		var checkedSeats = req.body.CheckedSeats;*/
		
		var ticketsList = {};
		var sSQL = "";
		var sSQLTrans = "";
		var sSQLTickets = "";
		
		console.log('seats:');
		console.log(seats);
		
		if (seats.IDEvent !== 'undefined') {
			var nEventID = seats.IDEvent;
			sSQL = "";
			seats.Seats.forEach(function(seat) {
				var sectorName = seat.SectorName;
				var rowN = seat.RowN;
				var seatN = seat.SeatN;
				var seatPrice = seat.Price;
				var sUpdate = `update public."tTicket" set "IDStatus" = 5
								where "IDSeat" in (select s."ID" from public."tSeat" s 
													where s."SectorName" = \'`+sectorName+`\' 
													and s."RowN" = `+rowN+` 
													and s."SeatN" = `+seatN+`) 
								and "IDEvent" = `+nEventID+`
								and "IDStatus" = 3;`;
				sSQL = sSQL + sUpdate;
			});
			
			//console.log(sSQL);
			db.db.any(sSQL)
				.then(function(){
					//console.log('ticketsList: '+ JSON.stringify(data));
					console.log('saled tickets statuses updated');
					
					sSQLTickets = 'select "ID", "IDStatus", "IDSeat", "IDEvent" from public."tTicket" where "IDStatus" = 5 and "IDSeat" in (select s."ID" from public."tSeat" s where s."SectorName" = \''+sectorName+'\' and s."RowN" = '+rowN+' and s."SeatN" = '+seatN+') and "IDEvent" = '+nEventID+';';
					db.db.any(sSQLTickets)
						.then(function(tickets){
							sSQLTrans = "";
							tickets.forEach(function(tick) {
								var ticketID = tick.ID;
								
								// TODO: how to get value of idticket?
								var sTransInsert = 'insert into public."tTrans" ( "IDTicket", "Saledate", "IDUserSaler" ) values '
													+'( '+ticketID+', now(), '+nUserID+' ); ';
								sSQLTrans = sSQLTrans + sTransInsert;
							});
							db.db.any(sSQLTrans)
								.then(function(){
									console.log('transactions inserted');
									res.status(200)
										.json({
											ReqStatus: 'success',
											Message: 'saled tickets saved and transactions created'
										});
								})
								.catch(function(errInsTr){
									console.log('error of insert transactions of saled tickets:');
									console.log(errInsTr);
									res.status(errInsTr.status)
										.json({
											ReqStatus: 'error',
											Message: 'cannot create transactions for saled tickets, event '+nEventID
										});
								});
						})
						.catch(function(errSrchTick){
							console.log('error of search saled tickets:');
							console.log(errSrchTick);
							res.status(errSrchTick.status)
								.json({
									ReqStatus: 'error',
									Message: 'cannot find saled tickets for event '+nEventID
								});
						});
					
					
					
				})
				.catch(function(err){
					//return next(err);
					console.log('error of update saled tickets:');
					console.log(err);
					res.status(err.status)
						.json({
							ReqStatus: 'error',
							Message: 'saling tickets not saved'
						});
				});
		}
		else {
			res.status(404)
				.json({
					ReqStatus: 'error',
					Message: 'event not found, so no tickets updated'
				});
		}
	});

		//вход на страницу выбранного мероприятия
	router.post('/beta/tickets/reserve/', function(req, res, next){
		
		let params = req.body;
		params = JSON.stringify(params);
		params = JSON.parse(params);
		console.log(params);
		if ((typeof params['tickets[]']) == 'string' ) params['tickets[]'] = [params['tickets[]']];
		// 4 status - резерв ( в данном случае - кассовый резерв )
		var sSQLQuery = `SELECT tic."IDStatus", tic."ID"
						FROM public."tTicket" tic
						where "ID" in (${params['tickets[]']})`;
		db.db.any(sSQLQuery)
			.then((data) => {
				let sSQL = '';
				console.log(data);
				let errTickets = [];
				data.forEach((ticket) => {
					if (ticket.IDStatus != 3) errTickets.push(ticket.ID);
				})
				if ( errTickets.length == 0 ){
					let sSQL = '';
					// approve всех билетов произошел
					params['tickets[]'].forEach((item) => {
						// 4 status - резерв ( в данном случае - кассовый резерв )
						var sUpdate = `update public."tTicket" set "IDStatus" = 4
										where "ID" = ${item}
										AND "IDStatus" = 3;`;
						sSQL = sSQL + sUpdate;
					})
					db.db.any(sSQL)
						.then(() => {
							let sSQLTrans = '';
							params['tickets[]'].forEach(function(item) {

								var sTransInsert = `insert into public."tTrans" 
														( "IDTicket", "Saledate", "IDUserSaler" ) values 
														( ${item}, now(), 1 ); `;
								sSQLTrans = sSQLTrans + sTransInsert;
							});
							db.db.any(sSQLTrans);
							res.json({success: true})
							return;
						});
				}
				else {
					res.json({success: false, errTickets: errTickets});
					console.log(errTickets);
					return;
				}
			})
	})

	router.get('/get/barcode/:text', function(req, res){

		
		// format: /get/barcode/?bcid=ean13&text=123456789012
		req.query = { 
			bcid: "ean13", 
			text: req.params.text, 
			scale: 3, 
			height: 10, 
			includetext: true, 
			textxalign: 'center' 
		};

	    req.url = "?"
	    for(var attr in req.query) { 
		    req.url += `&${attr}=${req.query[attr]}`; 
		}
		console.log(req.url)

	    if (!req.query.bcid ) {
	        res.writeHead(404, { 'Content-Type':'text/plain' });
	        res.end('Unknown request format.', 'utf8');
	    } else {
	        bwipjs(req, res);
	    }
	})
		
}