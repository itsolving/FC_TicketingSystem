app = {};

$(function () {
  app.init();
});

app.init = function () {
  app.initFluid();

  // $('#main-svg').panzoom({
  //   contain: "invert",
  //   minScale: 1
  // }).panzoom("zoom");

  zoom = panzoom(document.getElementById('stadiumSVG'), {
    smoothScroll: false,
    contain: 'invert',
    onStart: function () {
      console.log(1)
    }
  });
  zoom.on('panzoomstart', function (e, panzoom, matrix, changed) {
    console.log(2)
  });

  app.zoomTribune(zoom);
  app.getEventsList(); //Temp
  app.checkEvent(); //Temp
  app.setDataForTribuneTooltip(1);
  app.getTickets(1);
  app.endPreloading();
};

app.initFluid = function () {
  // при старте от 1920 на ноутбуке 1366 в тултипах очень мелко
  // var baseWidth = 1920
  var baseWidth = 1366,
    baseSize = 10;

  _helper();
  $(window).on('resize', _helper);

  function _helper() {
    if (device.tablet()) {
      baseWidth = 768;
    }
    if (device.mobile()) {
      baseWidth = 375;
    }

    $('html').css({
      'font-size': Math.min($(window).width() / baseWidth * baseSize, 10) + 'px'
    });
  }
};

app.calibrateTribune = function (tribune) {
  var leter1 = tribune[0],
    leter2 = tribune[1],
    cal = {
      calibrateX: 0,
      calibrateY: 0
    };

  switch (leter1) {
    case 'W':
      cal.calibrateX = 30;
      cal.calibrateY = -50;
      break;
    case 'S':
      cal.calibrateX = -50;
      cal.calibrateY = (leter2 === 'E') ? 150 : (leter2 === 'W') ? 0 : 50;
      break;
    case 'E':
      cal.calibrateX = 30;
      cal.calibrateY = 150;
      break;
    case 'N':
      cal.calibrateX = 100;
      cal.calibrateY = (leter2 === 'E') ? 150 : (leter2 === 'W') ? 0 : 50;
      break;
  }

  return cal;
};

app.zoomTribune = function (zoom) {
  $('[data-tribune][data-available=true]').each(function () {
    var _self = $(this);
    _self.on('click', function () {
      var scaleMultiplier = 2,
        selfData = app.calibrateTribune(_self.data('tribune'));

      zoom.zoomAbs(_self.offset().left + selfData.calibrateX, _self.offset().top + selfData.calibrateY, scaleMultiplier);
    });
  });
};

app.getEventsList = function () {
  $.get('/getevents', function (data) {
    if (data.status === "success") {
      data.events.forEach(function (item) {
        $('select#eventsSelect').append('<option value="' + item.Name + '" data-event-id="' + item.ID + '">' + item.Name + '</option>');
      });
    }
  });
};

app.checkEvent = function () {
  $('select#eventsSelect').change(function () {
    app.getTickets($('#eventsSelect option:selected').data('eventId'));
  });
};

app.getTickets = function (id) {
  var $tribune = $('[data-tribune][data-available=true]');
  id = id !== 'undefined' ? id : 1;
  $tribune.each(function () {
    var _self = $(this);
    _self.on('click touchstart', function () {
      $.post('/getsectortickets', {
        IDEvent: id,
        SectorName: _self.data('tribune')
      }, function (data) {
        console.log(data);
        if (data.TicketData.length > 0) {
          var data = data.TicketData[0].row_to_json;

          $.fancybox.open($('[data-popup]'), {
            beforeShow: function () {
              $('[data-popup-title]').text(data.SectorRu);
              $.get('../images/sectors/' + _self.data('tribune') + '.svg', null, function (svg) {
                $("svg", svg).prependTo($('[data-popup-svg]'));
                app.tribuneSeatData();
                app.setDataForSeatTooltip(data);
              }, 'xml');
            },
            afterClose: function () {
              $('[data-popup-svg]').html('');
            }
          });
        } else {
          $.fancybox.open('<div class="popup t-a-c"><h2>Билетов в данной трибуне нет!</h2></div>');
        }
      }, 'json');
    });
  });
};

app.endPreloading = function () {
  $('[data-preloader]').fadeOut();
  $('html').css('overflow', 'visible');
};

// temp function
app.tribuneSeatData = function () {
  $('[data-popup-svg] svg g g').each(function (indexLine) {
    $(this).attr('data-line', indexLine);
    $('circle', this).each(function (indexSeat) {
      $(this).attr('data-line', indexLine);
      $(this).attr('data-seat', indexSeat);
    });
  });
};

app.showTooltip = function () {
  $('.tooltip').addClass('show');
};

app.hideTooltip = function () {
  $('.tooltip').removeClass('show');
};

app.moveTooltip = function (e) {
  app.showTooltip();
  app.setContentTooltip(this);

  $('.tooltip').css({
    top: e.clientY + 10,
    left: e.clientX + 10
  });
};

app.setListenerTooltip = function (e) {
  $tooltips = $('[data-show-tooltip=init-wait]');
  $tooltips.attr('data-show-tooltip', 'ready');
  $tooltips.on('touchstart', app.showTooltip);
  $tooltips.on('mousemove touchstart', app.moveTooltip);
  $tooltips.on('mouseleave', app.hideTooltip);
};

app.setContentTooltip = function (elem) {
  var $tooltip = $('.tooltip');
  var data = $(elem).data('tooltip');
  var line = $(this).data('line');
  var seat = $(this).data('seat');

  function setRowTooltip(name, value) {
    $('[data-tooltip-bind=' + name + ']').show();

    if (value) {
      $('[data-tooltip-bind=' + name + ']').text(value);
    }
  }

  $('[data-tooltip-bind]').hide();

  console.log(data);

  if (data.type === 'tribune') {
    if (!data.available) {
      setRowTooltip('unavailable');
      setRowTooltip('unavailable-tribune');
      setRowTooltip('tip-seats-unavailable');
    } else {
      setRowTooltip('price-range');
      setRowTooltip('price-range-min', data.minPrice);
      setRowTooltip('price-range-max', data.maxPrice);
      setRowTooltip('tip-seats-available');
      setRowTooltip('seats-available', data.seatsLeft);
    }

    setRowTooltip('title', data.title);
  }

  if (data.type === 'seat') {
    if (data.status === 1) {
      setRowTooltip('unavailable');
      setRowTooltip('unavailable-seat');
    }

    if (data.status === 2) {
      setRowTooltip('unavailable');
      setRowTooltip('order-seat');
      setRowTooltip('tip-seat-order');
    }

    if (data.status === 3) {
      setRowTooltip('tip-select');
      setRowTooltip('price');
      setRowTooltip('price-seat', data.price);
    }

    setRowTooltip('seat-info');
    setRowTooltip('line', data.line);
    setRowTooltip('seat', data.seat);
    setRowTooltip('title', data.title);
  }

  // var available = data.IDStatus == 3 ? true : false;

  // $tooltip.attr('data-available-seat', available);
  // $tooltip.find('[data-tooltip-price]').text(data.Price);
  // $tooltip.find('[data-tooltip-tribune]').text(data.SectorRu);
  // $tooltip.find('[data-tooltip-line]').text(data.RowN);
  // $tooltip.find('[data-tooltip-seat]').text(data.SeatN);
};

app.setDataForTribuneTooltip = function (id) {
  var id = id !== 'undefined' ? id : 1;

  $('[data-tribune]').each(function (index) {
    var $tribune = $(this);
    var available = index % 2 === 0 ? true : false; // temp

    $tribune.attr('data-show-tooltip', 'init-wait');
    $tribune.attr('data-available', available);
    $tribune.data('tooltip', {
      type: 'tribune',
      available: available,
      title: $tribune.data('tribune'),
      maxPrice: 9999,
      minPrice: 99,
      seatsLeft: 28
    });

    // $.post('/getsectortickets', {
    //   IDEvent: id,
    //   SectorName: $tribune.data('tribune')
    // }, function (data) {
    //   data = data.TicketData[0].row_to_json;
    //   available = data.seatsLeft > 0 ? true : false;

    //   $tribune.data('show-tooltip', {
    //     availableTribune: available,
    //     tribune: data.SectorRu,
    //     maxPrice: data.maxPrice,
    //     minPrice: data.minPrice,
    //     seatsLeft: data.seatsLeft
    //   });
    // });
  });

  app.setListenerTooltip();
};

app.setDataForSeatTooltip = function (data) {
  console.log(data)

  data.minPrice = 1000;
  data.maxPrice = 10000;

  $('[data-seat]').each(function (index) {
    var $seat = $(this);
    var random2 = Math.random().toFixed(1) < 0.5 ? Math.random().toFixed(1) >= 0.9 ? 2 : 1 : 3; // temp
    var random3 = Math.random().toFixed(1) // temp

    $seat.attr('data-show-tooltip', 'init-wait');
    $seat.attr('data-status', random2);
    // $seat.css({
    //   opacity: random3
    // });

    $seat.data('tooltip', {
      type: 'seat',
      status: random2,
      title: data.SectorRu,
      price: 1000 * random3,
      seat: index,
      line: 28
    });

    // $.post('/getsectortickets', {
    //   IDEvent: id,
    //   SectorName: $tribune.data('tribune')
    // }, function (data) {
    //   data = data.TicketData[0].row_to_json;
    //   available = data.seatsLeft > 0 ? true : false;

    //   $tribune.data('show-tooltip', {
    //     availableTribune: available,
    //     tribune: data.SectorRu,
    //     maxPrice: data.maxPrice,
    //     minPrice: data.minPrice,
    //     seatsLeft: data.seatsLeft
    //   });
    // });
  });

  app.setListenerTooltip();
};