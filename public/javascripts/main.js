app = {};

$(function () {
  app.init();

  $('.cart__buy, .cart__ticket-remove').on('click', function () {
    $('.cart').toggleClass('cart--gray')
  });
});
var zoom;
app.init = function () {
  app.initFluid();

  var $stadiumSVG = $('#stadiumSVG');
  var stadiumSVG = document.getElementById('stadiumSVG').getBoundingClientRect();
  var body = document.body.getBoundingClientRect();

  var svgStartZoom = (body.height / stadiumSVG.height) * 0.96;
  var svgStartOffsetX = (body.width / 2) * (1 + svgStartZoom) - ((stadiumSVG.width * svgStartZoom) / 2) - (body.width * 0.0732);
  // var svgStartOffsetX = (body.width / 2);

  // console.log(stadiumSVG, body)

  zoom = panzoom($stadiumSVG[0], {
    smoothScroll: false,
    maxZoom: 2,
    minZoom: 0.3,
    zoomSpeed: 0.25,
  });

  zoom.zoomAbs(
    svgStartOffsetX,
    0,
    svgStartZoom
  );


  zoom.on('panstart', function (e) {
    $stadiumSVG.addClass('draggable')
    console.log()
  });

  zoom.on('panend', function (e) {
    $stadiumSVG.removeClass('draggable')
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
  id = id !== 'undefined' ? id : 1;

  $('[data-tribune]').each(function () {
    var $tribune = $(this);
    $tribune.on('click touchstart', function () {
      tribuneName = $tribune.data('tribune');
      $exist = $('[data-popup-svg-elem=' + tribuneName + ']');

      if ($exist.length === 1) {
        $.fancybox.open($('[data-popup]'), {
          baseClass: 'tribune-fancybox',
          beforeShow: function () {
            $('[data-popup-title]').text(tribuneName);
            $('[data-popup-svg]').attr('data-popup-svg', tribuneName);
            $exist.show();
          },
          afterClose: function () {
            $('[data-popup-svg] svg').hide();
          }
        });

        return;
      }

      app.startPreloading();

      $.post('/getsectortickets', {
        IDEvent: id,
        SectorName: tribuneName
      }, function (data) {
        console.log(data);
        if (data.TicketData.length > 0) {
          var data = data.TicketData[0].row_to_json;

          $.fancybox.open($('[data-popup]'), {
            baseClass: 'tribune-fancybox',
            beforeShow: function () {
              $('[data-popup-title]').text(data.SectorRu);

              $.get('../images/sectors/' + tribuneName + '.svg', null, function (svg) {
                $("svg", svg).prependTo($('[data-popup-svg]'));
                $('[data-popup-svg]').attr('data-popup-svg', tribuneName)
                $('[data-popup-svg] svg:first-child').attr('data-popup-svg-elem', tribuneName)

                app.tribuneSeatData();
                app.setDataForSeatTooltip(data);
              }, 'xml');
            },
            afterShow: function () {
              app.stopPreloading();
            },
            afterClose: function () {
              $('[data-popup-svg] svg').hide();
              //$('[data-popup-svg]').html('');
            }
          });
        } else {
          app.stopPreloading();
          $.fancybox.open('<div class="popup t-a-c"><h2>Билетов в данной трибуне нет!</h2></div>', {
            baseClass: 'tribune-fancybox',
          });
        }
      }, 'json');
    });
  });
};

app.startPreloading = function () {
  $('[data-preloader]').fadeIn(280);
  $('html').css('overflow', 'hidden');
};

app.stopPreloading = function () {
  $('[data-preloader]').hide();
  $('html').css('overflow', 'visible');
};

app.endPreloading = function () {
  $('[data-preloader]').fadeOut(280);
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
  var id = (id !== 'undefined') ? id : 1;

  $('[data-tribune]').each(function (index) {
    var $tribune = $(this);
    var tribuneName = $tribune.data('tribune');

    if (index > 885) return;

    $.post('/getsectortickets', {
      IDEvent: id,
      SectorName: tribuneName
    }, function (res) {
      $tribune.attr('data-load', true);

      if (res.TicketData.length === 0) return;

      data = res.TicketData[0].row_to_json
      available = data.seatsLeft > 0 ? true : false;

      $tribune.attr('data-show-tooltip', 'init-wait');
      $tribune.attr('data-available', available);
      $tribune.data('tooltip', {
        type: 'tribune',
        available: available,
        title: data.SectorRu,
        maxPrice: data.maxPrice,
        minPrice: data.minPrice,
        seatsLeft: data.seatsLeft
      });

      app.setListenerTooltip();
    });

  });
};


// метод gettickets очень медленный, нерабочее решение

// app.setDataForTribuneTooltip = function (id) {
//   var id = (id !== 'undefined') ? id : 1;

//   $.post('/gettickets', {
//     IDEvent: id,
//   }, function (res) {

//     console.log(res);

//     $('[data-tribune]').each(function (index) {
//       var $tribune = $(this);
//       var tribuneName = $tribune.data('tribune');

//       res.TicketData.forEach(function (data) {
//         data = data.row_to_json;

//         if (data.SectorName === tribuneName) {
//           available = data.seatsLeft > 0 ? true : false;

//           $tribune.attr('data-show-tooltip', 'init-wait');
//           $tribune.attr('data-available', available);
//           $tribune.data('tooltip', {
//             type: 'tribune',
//             available: available,
//             title: data.SectorRu,
//             maxPrice: data.maxPrice,
//             minPrice: data.minPrice,
//             seatsLeft: data.seatsLeft
//           });
//         }
//       });
//     });

//     app.setListenerTooltip();
//     app.getTickets(1);
//   });
// };

app.setDataForSeatTooltip = function (data) {
  $('[data-seat]').each(function (index) {
    var $seat = $(this);
    var line = $seat.data('line');
    var seat = $seat.data('seat');

    data = {
      status: 3,
      title: 'W4(верх)',
      price: 1450,
      seat: 28,
      line: 82
    }

    $seat.attr('data-show-tooltip', 'init-wait');
    $seat.attr('data-status', data.status);

    $seat.data('tooltip', {
      type: 'seat',
      status: data.status,
      title: data.title,
      price: data.price,
      seat: data.seat,
      line: data.line
    });
  });

  app.handlerForAvaliableSeats()
  app.setListenerTooltip();
};

app.handlerForAvaliableSeats = function () {
  $('[data-seat][data-status=3]').on('click', function () {
    $seat = $(this);

    inCart = $seat.toggleClass('in-cart');




    console.log(inCart)

    ;
  });

}