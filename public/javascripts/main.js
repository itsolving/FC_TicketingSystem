app = {};

$(function () {
	app.init();
});

app.init = function () {
  var zoom = panzoom(document.getElementById('stadiumSVG'), {smoothScroll: false});
  app.zoomTribune(zoom);
	app.getEventsList();
	app.checkEvent();
  app.getTickets(1); // 1 - временный id при загрузке страницы.
  // На проде передавать id динамически при выборе соответствующего мероприятия.
  app.initPopup();
};

app.calibrateTribune = function(tribune){
  var leter1 = tribune[0],
      leter2 = tribune[1],
      cal = {
        calibrateX: 0,
        calibrateY: 0
      };

  switch(leter1){
    case 'W': cal.calibrateX = 30; cal.calibrateY = -50; break;
    case 'S': cal.calibrateX = -50;
              cal.calibrateY = (leter2 === 'E') ? 150 : (leter2 === 'W') ? 0 : 50; break;
    case 'E': cal.calibrateX = 30; cal.calibrateY = 150; break;
    case 'N': cal.calibrateX = 100;
              cal.calibrateY = (leter2 === 'E') ? 150 : (leter2 === 'W') ? 0 : 50; break;
  }

  return cal;
};

app.zoomTribune = function(zoom){
  $('[data-tribune]').each(function(){
    var _self = $(this);
    _self.on('click', function(){
      var scaleMultiplier = 2,
          selfData = app.calibrateTribune(_self.data('tribune'));

      zoom.zoomAbs(_self.offset().left + selfData.calibrateX, _self.offset().top + selfData.calibrateY, scaleMultiplier);
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
      data.TicketData.forEach(function(tribune){
        tribune.row_to_json.tickets.forEach(function(ticket){
          //console.log(ticket.RowN);
          //$('[data-seat]').clone().appendTo($('[data-tribune-line]').filter('[data-tribune-line="' + ticket.RowN + '"]'));
        });
      });
    }
  });
  app.endPreloading();
};

app.initPopup = function(){
  var $btn = $('[data-init-popup]'),
      $popup = $('[data-popup]');

  $btn.on('click', function(){
    $.fancybox.open($popup);
  });
};

app.endPreloading = function(){
  $('[data-preloader]').fadeOut();
  $('html').css('overflow', 'visible');
};