app = {};

$(function () {
	app.init();
});

app.init = function () {
	app.getEventsList();
};

app.getEventsList = function(){
  $.get('/events', function(data){
    console.log(data);
  });
};