let rootUtils = require('./root.js');

class EventsUtils extends rootUtils{
	constructor(Client, conOptions){
		super();
		this.Client = Client;
		this.conOptions = conOptions;
	}
	getNameId(next){

		var sSQL = 'SELECT ev."ID", ev."Name", "IDStadium" from public."tEvent" ev';
		console.log(sSQL);

		this.execute(sSQL, (events) => {
			next(events);
		})

	}
	getAll(next, api){
		var sSQL = `SELECT ev."ID", ev."Name", ev."MaxTickets", ev."Abonement", ev."SaledTickets", ev."ImgPath", ev."IDTemplate", ev."IDStatus", TO_CHAR(ev."DateFrom", \'DD-MM-YYYY HH24:MI\') as "DateFrom",
					TO_CHAR(ev."Dateto", \'DD-MM-YYYY HH24:MI\') as "Dateto", ev."IDUserCreator", ev."CreateDate", ev."IDStadium",
					sd."Name" as "StadiumName", st."Name" as "StatusName"
					FROM public."tEvent" ev
					join public."tStadium" sd on ev."IDStadium" = sd."ID"
					join public."tStatus" st on ev."IDStadium" = st."ID"
					where ev."IDStatus" = 1 /*and ev."Dateto" >= now()*/ 
					 `;
		if ( api ) sSQL = sSQL + 'AND ev."ShowAPI" = true ';
		sSQL = sSQL + 'order by ev."DateFrom", ev."ID"';
		console.log(sSQL);

		this.execute(sSQL, (events) => {
			console.log(events);
			next(events);
		})

	}
	getStatus(nID, next){

		var sSQL = `SELECT ev."ID", ev."Name", ev."IDStatus",
					s."Name" as "StatusName"
					FROM public."tEvent" ev
					left join public."tStatus" s on s."ID" = ev."IDStatus"
					where ev."ID" = ${nID}`;
		console.log(sSQL);

		this.execute(sSQL, (events) => {
			next(events);
		})
	}
	// insert(postOperation, next){
	// 	var sSQL = "";
	// 	if (postOperation == "ins") {
	// 		sSQL = `insert into public."tEvent" ("ID", "Name", "IDStatus", "DateFrom", "IDStadium", "ShowOnline", "ShowCasher", "ShowAPI")
	// 				values(nextval(\'"tEvent_ID_seq"\'::regclass), \'Название мероприятия\', 1, now(), 1, false, false, false) RETURNING "ID"`;

	// 		console.log(sSQL);

	// 		this.execute(sSQL, (data) => {
	// 			let newEventID = 0,
	// 			    sResultMsg = "";

	// 			if ( data.length > 0 ){
	// 				newEventID = data[0].ID;
	// 				sResultMsg = "ok, new EventID="+newEventID;
	// 			}
	// 			else {
	// 				sResultMsg = "ERROR!";
	// 			}
	// 			next({ResultMsg: sResultMsg, ID: newEventID});

	// 		})
	// 	}
	// }
	update(eventData, next){
		const client = new this.Client(this.conOptions);
		client.connect();
		var sSQL = "";
		if (eventData.sPostOperation == "del") {
			sSQL = 'update public."tEvent" set "IDStatus"=2 '+
					'where "ID" = '+eventData.nID;
		} else {
			sSQL = `update public."tEvent" set
					"Name"='${eventData.sEventName}',
					"MaxTickets" = ${eventData.MaxTickets},
					"ImgPath"='${eventData.sImgPath}',
					"DateFrom"='${eventData.sDateFrom}',
					"IDStadium"=${eventData.nStadiumID},
					"ShowOnline" = ${eventData.bshowOnline},
					"ShowCasher" = ${eventData.bshowCasher},
					"IDTemplate" = ${eventData.nTemplateID},
			 		"ShowAPI" = ${eventData.bshowAPI},
			 		"Abonement" = ${eventData.Abonement}
					where "ID" = ${eventData.nID}`;
		}
		console.log(sSQL);
		client.query(sSQL, (qerr, qres) => {
			var sResMsg = "";
			if (eventData.sPostOperation == "del") {
				sResMsg = "Удалено";
			}
			else {
				sResMsg = "Сохранено";
			}
			if (qerr) {
				console.log("qerr:");
				console.log(qerr ? qerr.stack : qres);
				sResMsg = "Ошибка выполнения: "+qerr;
			}
			client.end();
			next(sResMsg);
		});
	}
	getById(nID, next, api){
		var rowEventData = {};
		const client = new this.Client(this.conOptions);
		client.connect();
		var sSQL = `SELECT ev."ID", ev."Abonement", ev."MaxTickets", ev."Name", ev."ImgPath", ev."IDTemplate", ev."IDStatus",
						replace(TO_CHAR(ev."DateFrom", \'YYYY-MM-DD HH24:MI\'), \' \', \'T\') as "DateFrom",
						replace(TO_CHAR(ev."Dateto", \'YYYY-MM-DD HH24:MI\'), \' \', \'T\') as "Dateto",
						ev."IDUserCreator", ev."CreateDate", ev."IDStadium",
						sd."Name" as "Stadium", s."Name" as "StatusName",
						ev."ShowOnline", ev."ShowCasher", ev."ShowAPI"
					FROM public."tEvent" ev
					join public."tStadium" sd on ev."IDStadium" = sd."ID"
					left join public."tStatus" s on s."ID" = ev."IDStatus"
					where /* ev."IDStatus" = 1 */ /*and ev."Dateto" >= now()*/ ev."ID" = ${nID} `;

		if ( api ) sSQL = sSQL + ' AND ev."ShowAPI" = true';

		//console.log(sSQL);
		client.query(sSQL, (qerr, qres) => {
			if (qerr) {
				console.log("qerr:");
				console.log(qerr ? qerr.stack : qres);
			}
			else {
				//console.log(qres)
				console.log(qres.rows)
				//console.log(qerr ? qerr.stack : qres);

				if (typeof qres.rowCount === 'undefined') {
					console.log('rowEventData res.rowCount not found');
				}
				else {
					if (qres.rowCount == 0) {
						console.log('rowEventData res.rowCount='+qres.rowCount);
						rowEventData = qres.rows;
					}
					else {
						rowEventData = qres.rows;
					}
				}
			}
			client.end();
			next(rowEventData, qres);
		})
	}
	logGetByID(nUserID, nEventID, dataCount, next){
		var sDescr = "";
		if (dataCount > 0) {
			sDescr = "Event found.";
		}
		else {
			sDescr = "Event not found.";
		}
		let sSQL = `insert into public."tLogUserActions" ( "IDUser", "Descr", "ADate")
				values('${nUserID}', 'get event data by ID=${nEventID}. ${sDescr}', now()) RETURNING "ID"`;

		console.log(sSQL);

		this.execute(sSQL, (data) => {
			let newLogID = 0,
			    isError = false;

			if ( data.length > 0 ){
				newLogID = data[0].ID;
				isError = false;
			}
			else {
				isError = true;
			}
			next({ResultIsOK: isError});

		})
	}
	getByStadium(nID, next, api){
		var sSQL = `SELECT ev."ID", ev."Name", ev."ImgPath", ev."IDTemplate", ev."IDStatus", TO_CHAR(ev."DateFrom", \'DD-MM-YYYY HH24:MI\') as "DateFrom",
					TO_CHAR(ev."Dateto", \'DD-MM-YYYY HH24:MI\') as "Dateto", ev."IDUserCreator", ev."CreateDate", ev."IDStadium",
					sd."Name" as "StadiumName", st."Name" as "StatusName"
					FROM public."tEvent" ev
					join public."tStadium" sd on ev."IDStadium" = sd."ID"
					join public."tStatus" st on ev."IDStadium" = st."ID"
					where ev."IDStatus" in (1, 2) 
					AND ev."IDStadium" = ${nID} `;
		if ( api ) sSQL = sSQL + 'AND ev."ShowAPI" = true ';
		sSQL = sSQL + 'order by ev."DateFrom", ev."ID"';
		console.log(sSQL);

		this.execute(sSQL, (events) => {
			next(events);
		})
	}

	customSelect(next){
		let sSQL = `SELECT "ID", "Name", "ImgPath", "DateFrom" FROM public."tEvent" where "IDStatus" = 1`;
		this.execute(sSQL, (events) => {
			next(events);
		})
	}

	create(event, next){
	
		let sSQL = `insert into public."tEvent" ( "Name", "IDUserCreator", "MaxTickets", "SaledTickets", "ImgPath", "IDTemplate", "IDStatus", "DateFrom", "IDStadium", "ShowOnline", "ShowCasher", "ShowAPI", "Abonement")
				values('${event.Name}', ${event.IDUserCreator}, ${event.MaxTickets}, 0, '${event.ImgPath}', ${event.IDTemplate}, ${event.IDStatus}, '${event.DateFrom || 'now()'}', ${event.IDStadium}, ${event.ShowOnline}, ${event.ShowCasher}, ${event.ShowAPI}, ${event.Abonement}) RETURNING "ID"`;

		console.log(sSQL);

		this.execute(sSQL, (data) => {
			let newEventID = 0,
			    sResultMsg = "";

			if ( data.length > 0 ){
				newEventID = data[0].ID;
				sResultMsg = "ok, new EventID="+newEventID;
			}
			else {
				sResultMsg = "ERROR!";
			}
			next({ResultMsg: sResultMsg, ID: newEventID});

		})
	}
	getEventTickets(id, next){
		let sSQL = `SELECT * FROM public."tEvent" WHERE "ID" = ${id}`;

		console.log(sSQL);
		this.execute(sSQL, (data) => {
			next(data[0]);
		}) 
	}
	ChangeEventTickets(id, value, next){
		let sSQL = `UPDATE public."tEvent" 
					   SET "SaledTickets" = "SaledTickets" + ${value}
					WHERE "ID" = ${id}`;
		console.log(sSQL);
		this.execute(sSQL, (data) => {
			next(data);
		})
	}
	getArchived(next){
		var sSQL = `SELECT ev."ID", ev."Name", ev."MaxTickets", ev."SaledTickets", ev."ImgPath", ev."IDTemplate", ev."IDStatus", TO_CHAR(ev."DateFrom", \'DD-MM-YYYY HH24:MI\') as "DateFrom",
					TO_CHAR(ev."Dateto", \'DD-MM-YYYY HH24:MI\') as "Dateto", ev."IDUserCreator", ev."CreateDate", ev."IDStadium",
					sd."Name" as "StadiumName", st."Name" as "StatusName"
					FROM public."tEvent" ev
					join public."tStadium" sd on ev."IDStadium" = sd."ID"
					join public."tStatus" st on ev."IDStadium" = st."ID"
					where ev."IDStatus" = 2 /*and ev."Dateto" >= now()*/ 
					 order by ev."DateFrom", ev."ID"`;
		console.log(sSQL);

		this.execute(sSQL, (events) => {
			next(events);
		})

	}

	getActive(next){
		let sSQL = `SELECT "ID", "Name", "ImgPath", "DateFrom" FROM public."tEvent" where "IDStatus" = 1`;

		console.log(sSQL);

		this.execute(sSQL, (data) => {
			next(data);
		})
	}
	getByAbonement(next){
		let sSQL = `SELECT "ID" FROM public."tEvent" 
						WHERE "IDStatus" = 1 
						AND "Abonement" = true`;

		console.log(sSQL);

		this.execute(sSQL, (data) => {
			next(data);
		})
	}


}

module.exports = EventsUtils;
