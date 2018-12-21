app = {};

$(function () {
	app.init();
});

app.init = function () {
	app.getEventsList();
};

app.getEventsList = function(){
  $.post('/gettickets', {IDEvent: 1}, function(data){
    console.log(data);
  });
};