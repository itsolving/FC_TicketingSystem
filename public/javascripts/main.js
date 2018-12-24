app = {};

$(function () {
	app.init();
});

app.init = function () {
  panzoom(document.getElementById('stadiumSVG'));
	app.getEventsList();
	app.checkEvent();
  app.getTickets(1);
};

app.getEventsList = function(){
  var $select = $('select#eventsSelect');
  $.get('/getevents', function(data){
    if(data.status === "success"){
      data.events.forEach(function(item){
        $select.append('<option value="'+item.Name+'" data-event-id="'+item.ID+'">'+item.Name+'</option>');
      });
    }
  });
};

app.checkEvent = function(){
  $('select#eventsSelect').change(function(){
    app.getTickets($('#eventsSelect option:selected').data('eventId'));
  });
};

app.getTickets = function(id){
  //var $tribune = $('[data-tribune]');
  $.post('/gettickets', {IDEvent: id}, function(data){
    if(data.status === "success") {
      console.log(data);
    }
  });
};