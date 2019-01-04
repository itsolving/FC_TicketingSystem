$(document).ready(function(){
	var nEventID = 0;
	nEventID = $("#eventID").data("value");
	console.log("priceEditor.js loaded");
	$('.select-rowN').each(function(){
		var tr = $(this).parent().parent();
		var obj = $(tr).children().last().children().val();			// цена первого
		obj = JSON.parse(obj);
		let data = {
			rowN: obj.rowN,
			price: obj.price,
			sector: $(tr).children().first().text(),
			inputPrice: null
		};
		$(tr).children().first().next().children().first().val(data.price);	// подгружаем цену первого элемента
	})
	$('.select-rowN').change(function(){
		console.log('select-rowN change event');
		var obj = $(this).val();
		var tr = $(this).parent().parent();
		obj = JSON.parse(obj);
		let data = {
			rowN: obj.rowN,
			price: obj.price,
			sector: $(tr).children().first().text(),
			inputPrice: null
		};
		console.log(data);
		$(tr).children().first().next().children().first().val(data.price);	// ставим новую цену
	})


	$('.priceInput').change(function(){
		console.log('priceInput change event');
		var tr = $(this).parent().parent();
		var obj = $(tr).children().last().children().val();	
		var select = $(tr).children().last().children();
		var selected = $("option:selected", select);

		obj = JSON.parse(obj);
		let data = {
			rowN: obj.rowN,
			price: obj.price,
			sector: $(tr).children().first().text(),
			newPrice: $(this).val(),
			nEventID: nEventID
		};
		selected.val('{"rowN": ' + data.rowN + ', "price": ' + data.newPrice + '}');
		selected.text(data.rowN + " ( " + data.newPrice + ")");
		console.log(data);
		$(obj).val(data.rowN + " ( " + data.price + " )");

		$.ajax({
			url: '/admin/ticket/changeprice/',
			type: "POST",
			data: data,
			success: function(result){
				console.log(result);

			},
			error: function(err){
				console.log("POST /admin/ticket/changeprice/ error:");
				console.log(err);
			}
		});
	})
})