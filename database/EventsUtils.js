class EventsUtils{
	constructor(Client, conOptions){
		this.Client = Client;
		this.conOptions = conOptions;
	}
	getNameId(next){
		const client = new this.Client(this.conOptions);
		client.connect();

		var sSQL = 'SELECT ev."ID", ev."Name" from public."tEvent" ev';
		console.log(sSQL);

		var events = {};

		client.query(sSQL, (qerr, qres) => {
			if (qerr) {
				console.log("qerr:");
				console.log(qerr ? qerr.stack : qres);
			}
			if (typeof qres.rowCount === 'undefined') {
				console.log('res.rowCount not found');
			}
			else {
				if (qres.rowCount == 0) {
					console.log('res.rowCount='+qres.rowCount);
				}
				else {
					events = qres.rows;
				}
			}
			client.end();
			next(events);
		});
	}
	getAll(next){
		const client = new this.Client(this.conOptions);
		var events = {};
		//console.log('client.connect...');
		client.connect()
		var sSQL = 'SELECT ev."ID", ev."Name", ev."ImgPath", ev."IDStatus", TO_CHAR(ev."DateFrom", \'DD-MM-YYYY HH24:MI:SS\') as "DateFrom", '+
					'TO_CHAR(ev."Dateto", \'DD-MM-YYYY HH24:MI:SS\') as "Dateto", ev."IDUserCreator", ev."CreateDate", ev."IDStadium", '+
					'sd."Name" as "Stadium" '+
					'FROM public."tEvent" ev '+
					'join public."tStadium" sd on ev."IDStadium" = sd."ID" '+
					'where ev."IDStatus" = 1 /*and ev."Dateto" >= now()*/ '+
					'order by ev."DateFrom", ev."ID" ';
		console.log(sSQL);
		client.query(sSQL, (qerr, qres) => {
			if (qerr) {
				console.log("qerr:");
				console.log(qerr ? qerr.stack : qres);
			}
			else {
				//console.log(qerr ? qerr.stack : qres);
				
				if (typeof qres.rowCount === 'undefined') {
					console.log('res.rowCount not found');
				}
				else {
					if (qres.rowCount == 0) {
						console.log('res.rowCount='+qres.rowCount);
					}
					else {
						events = qres.rows;
					}
				}
			}
			client.end();
			next(events);
		});
	}
	getStatus(nID, next){
		var rowEventData = {};
		const client = new this.Client(this.conOptions);
		client.connect();
		var sSQL = 'SELECT ev."ID", ev."Name", ev."IDStatus", '+
					's."Name" as "StatusName" '+
					'FROM public."tEvent" ev '+
					'left join public."tStatus" s on s."ID" = ev."IDStatus" ' +
					'where ev."ID" = '+nID;
		console.log(sSQL);
		client.query(sSQL, (qerr, qres) => {
			if (qerr) {
				console.log("qerr:");
				console.log(qerr ? qerr.stack : qres);
			}
			else {
				//console.log(qerr ? qerr.stack : qres);
				
				if (typeof qres.rowCount === 'undefined') {
					console.log('res.rowCount not found');
				}
				else {
					if (qres.rowCount == 0) {
						console.log('res.rowCount='+qres.rowCount);
					}
					else {
						rowEventData = qres.rows;
					}
				}
			}
			client.end();
			next(rowEventData);
		});
	}
	insert(postOperation, next){
		const client = new this.Client(this.conOptions);
		var events = {};
		client.connect()
		var sSQL = "";
		if (postOperation == "ins") {
			sSQL = 'insert into public."tEvent" ("ID", "Name", "IDStatus", "DateFrom", "IDStadium", "ShowOnline", "ShowCasher", "ShowAPI") '+
					' values(nextval(\'"tEvent_ID_seq"\'::regclass), \'Новое\', 1, now(), 1, false, false, false) RETURNING "ID"';
			console.log(sSQL);
			client.query(sSQL, (qerr, qres) => {
				var newEventID = 0;
				var sResultMsg = "";
				if (qerr) {
					console.log("qerr:");
					console.log(qerr ? qerr.stack : qres);
					sResultMsg = qerr.stack;
				}
				else {
					console.log(qres.rows);
					newEventID = qres.rows[0].ID;
					console.log("newEventID="+newEventID);
					sResultMsg = "ok, new EventID="+newEventID;
				}
				client.end();
				//res.redirect('/admin/event/'+newEventID);
				next({ResultMsg: sResultMsg, ID: newEventID});
			});
		}
	}
	update(eventData, next){
		const client = new this.Client(this.conOptions);
		client.connect();
		var sSQL = "";
		if (eventData.sPostOperation == "del") {
			sSQL = 'update public."tEvent" set "IDStatus"=6 '+
					'where "ID" = '+eventData.nID;
		} else {
			sSQL = 'update public."tEvent" set "Name"=\''+eventData.sEventName+'\', "ImgPath"=\''+eventData.sImgPath+'\', '+
					'"DateFrom"=\''+eventData.sDateFrom+'\', "IDStadium"='+eventData.nStadiumID+', "ShowOnline" = '+eventData.bshowOnline+
					', "ShowCasher" = '+eventData.bshowCasher+', "ShowAPI" = '+eventData.bshowAPI+' '+
					'where "ID" = '+eventData.nID;
		}
		console.log(sSQL);
		client.query(sSQL, (qerr, qres) => {
			var sResMsg = "";
			if (eventData.sPostOperation == "del") {
				sResMsg = "Удалил";
			}
			else {
				sResMsg = "Сохранил";
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
	getById(nID, next){
		var rowEventData = {};
		const client = new this.Client(this.conOptions);
		client.connect();
		var sSQL = 'SELECT ev."ID", ev."Name", ev."ImgPath", ev."IDStatus", '+
					'replace(TO_CHAR(ev."DateFrom", \'YYYY-MM-DD HH24:MI\'), \' \', \'T\') as "DateFrom", '+
					'replace(TO_CHAR(ev."Dateto", \'YYYY-MM-DD HH24:MI\'), \' \', \'T\') as "Dateto", ev."IDUserCreator", ev."CreateDate", ev."IDStadium", '+
					'sd."Name" as "Stadium", s."Name" as "StatusName", '+
					'ev."ShowOnline", ev."ShowCasher", ev."ShowAPI" ' +
					'FROM public."tEvent" ev '+
					'join public."tStadium" sd on ev."IDStadium" = sd."ID" '+
					'left join public."tStatus" s on s."ID" = ev."IDStatus" ' +
					'where ev."IDStatus" = 1 /*and ev."Dateto" >= now()*/ and ev."ID" = '+nID;
		console.log(sSQL);
		client.query(sSQL, (qerr, qres) => {
			if (qerr) {
				console.log("qerr:");
				console.log(qerr ? qerr.stack : qres);
			}
			else {
				//console.log(qerr ? qerr.stack : qres);
				
				if (typeof qres.rowCount === 'undefined') {
					console.log('res.rowCount not found');
				}
				else {
					if (qres.rowCount == 0) {
						console.log('res.rowCount='+qres.rowCount);
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
}

module.exports = EventsUtils;