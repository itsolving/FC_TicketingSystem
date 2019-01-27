$(document).ready(function(){
	$('.get-api').click(function(){
		$.get('/api/get/apikey', function (ans) {
        	if ( ans.err ){
        		$.get('/api/get/apikey/new', function (ans) {
		        	if ( ans.err ){
		        		alert(ans.err);
		        	}
		        	else prompt("Ваш API Key:", ans.APIKEY);
		        });
        	}
        	else prompt("Ваш API Key:", ans.APIKEY);
        });
	})
})