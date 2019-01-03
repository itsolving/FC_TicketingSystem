app = {};

$(function () {
	app.init();
});

app.init = function () {
  var zoom = panzoom(document.getElementById('stadiumSVG'), {smoothScroll: false});
  app.zoomTribune(zoom);
	app.getEventsList(); //Temp
	app.checkEvent(); //Temp
  app.getTickets(1);
  app.endPreloading();
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
  var $tribune = $('[data-tribune]');
  id = id !== 'undefined' ? id : 1;
  $tribune.each(function(){
    var _self = $(this);
    _self.on('click', function(){
      $.post('/getsectortickets', {IDEvent: id, SectorName: _self.data('tribune')}, function(data){
        if(data.TicketData.length > 0){
          var $secInfo = data.TicketData[0].row_to_json;
          console.log($secInfo);
          $.fancybox.open({
            src: '../images/sectors/' + _self.data('tribune') + '.svg',
            type: 'ajax'
          });
        }else{
          console.log('Билетов нет!');
        }
      });
    });
  });
};

app.endPreloading = function(){
  $('[data-preloader]').fadeOut();
  $('html').css('overflow', 'visible');
};
