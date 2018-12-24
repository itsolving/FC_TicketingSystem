app = {};

$(function () {
	app.init();
});

app.init = function () {
  var zoom = panzoom(document.getElementById('stadiumSVG'), {smoothScroll: false});
  app.zoomTribune(zoom);
	app.getEventsList();
	app.checkEvent();
  app.getTickets(1);
  app.endPreloading();
};

app.zoomTribune = function(zoom){
  $('[data-tribune]').each(function(){
    var _self = $(this);
    _self.on('click', function(e){
      console.log(e);
    });
  });
};

app.getEventsList = function(){
  $.get('/getevents', function(data){
    if(data.status === "success"){
      data.events.forEach(function(item){
        $('select#eventsSelect').append('<option value="'+item.Name+'" data-event-id="'+item.ID+'">'+item.Name+'</option>');
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
  $.post('/gettickets', {IDEvent: id}, function(data){
    if(data.ReqStatus === "success") {
      console.log(data);
    }
  });
};

app.endPreloading = function(){
  $('[data-preloader]').fadeOut();
  $('html').css('overflow', 'visible');
};