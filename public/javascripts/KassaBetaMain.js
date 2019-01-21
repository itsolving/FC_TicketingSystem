app = {};

app.id = 1;

app.cart = {
  tickets: [],
  total: 0
};

$(function () {
  app.init();
});

app.init = function () {
  app.initFluid();

  var stadium = document.getElementById('stadiumSVG');
  var stadiumRect = stadium.getBoundingClientRect();
  var body = document.body.getBoundingClientRect();

  var svgStartZoom = (body.height / stadiumRect.height) * 0.96;
  var svgStartOffsetX = (body.width / 2) * (1 + svgStartZoom) - ((stadiumRect.width * svgStartZoom) / 2) - (body.width * 0.0732);

  var zoom = panzoom(stadium, {
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
    $(stadium).addClass('draggable');
  });

  zoom.on('panend', function (e) {
    $(stadium).removeClass('draggable');
  });

  // app.zoomTribune(zoom);
  // app.getEventsList(); //Temp
  // app.checkEvent(); //Temp
  // app.setDataForTribuneTooltip(1);
  // app.getTickets(1);
  app.tribuneInit();
  app.endPreloading();
};

app.tribuneInit = function () {
  // once request data than hover on tribune
  $('[data-tribune]').on('mouseenter touchstart', function () {
    var $tribune = $(this);
    var tribuneName = $tribune.data('tribune');
    var tribuneData = $tribune.data('tooltip');
    app.currentHoverTribune = $tribune;

    console.log($tribune.data('data'))

    $('[data-tribune]').data('hover', false);
    $tribune.data('hover', true);

    if (tribuneData) {
      return;
    }

    $tribune.attr('data-show-tooltip', 'init-wait');
    $tribune.data('tooltip', {
      type: 'loading',
    });
    app.setListenerTooltip();

    $.post('/getsectortickets', {
      IDEvent: app.id,
      SectorName: tribuneName
    }, function (res) {
      if (res.TicketData.length === 0) {
        console.error('Ошибка на сервере', res)
        $tribune.remove();
        return;
      };

      var data = res.TicketData[0].row_to_json
      var available = data.seatsLeft > 0 ? true : false;

      $tribune.attr('data-available-seats', available);

      $tribune.data('tooltip', {
        type: 'tribune',
        available: available,
        title: data.SectorRu,
        maxPrice: '' + data.maxPrice,
        minPrice: '' + data.minPrice,
        seatsLeft: data.seatsLeft
      });

      $tribune.data('data', data);

      // update tooltip when request done
      app.setContentTooltip($tribune, true);

      // show seats modal
      $tribune.on('click', app.showTribuneSeats);
    });
  });
}

app.showTribuneSeats = function () {
  var $tribune = $(this);
  var data = $tribune.data('data');

  function _showSvg() {
    var $exist = $('[data-popup-svg-elem=' + data.SectorName + ']');

    $('[data-popup-title]').text(data.SectorRu);
    $('[data-popup-svg]').attr('data-popup-svg', data.SectorName)

    if ($exist.length === 1) {
      $exist.show();
    } else {
      $.get('/images/sectors/' + data.SectorName + '.svg', null, function (svg) {
        $('svg', svg).prependTo($('[data-popup-svg]'));
        $('[data-popup-svg] svg:first-child').attr('data-popup-svg-elem', data.SectorName);

        app.setSeatsNumber(data);
      }, 'xml');
    }
  }

  $.fancybox.open($('[data-popup]'), {
    baseClass: 'tribune-fancybox',
    beforeShow: _showSvg,
    afterClose: function () {
      $('[data-popup-svg] svg').hide();
    }
  });
}

app.initFluid = function () {
  var baseWidth = 1366;
  var baseSize = 10;

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

  //------- beta

    $('.cart__buy').on('click', function() {
      app.reserve();
    });

    //------------
};

// app.calibrateTribune = function (tribune) {
//   var leter1 = tribune[0],
//     leter2 = tribune[1],
//     cal = {
//       calibrateX: 0,
//       calibrateY: 0
//     };

//   switch (leter1) {
//     case 'W':
//       cal.calibrateX = 30;
//       cal.calibrateY = -50;
//       break;
//     case 'S':
//       cal.calibrateX = -50;
//       cal.calibrateY = (leter2 === 'E') ? 150 : (leter2 === 'W') ? 0 : 50;
//       break;
//     case 'E':
//       cal.calibrateX = 30;
//       cal.calibrateY = 150;
//       break;
//     case 'N':
//       cal.calibrateX = 100;
//       cal.calibrateY = (leter2 === 'E') ? 150 : (leter2 === 'W') ? 0 : 50;
//       break;
//   }

//   return cal;
// };

// app.zoomTribune = function (zoom) {
//   $('[data-tribune][data-available=true]').each(function () {
//     var _self = $(this);
//     _self.on('click', function () {
//       var scaleMultiplier = 2,
//         selfData = app.calibrateTribune(_self.data('tribune'));

//       zoom.zoomAbs(_self.offset().left + selfData.calibrateX, _self.offset().top + selfData.calibrateY, scaleMultiplier);
//     });
//   });
// };

// app.getEventsList = function () {
//   $.get('/getevents', function (data) {
//     if (data.status === "success") {
//       data.events.forEach(function (item) {
//         $('select#eventsSelect').append('<option value="' + item.Name + '" data-event-id="' + item.ID + '">' + item.Name + '</option>');
//       });
//     }
//   });
// };

// app.checkEvent = function () {
//   $('select#eventsSelect').change(function () {
//     app.getTickets($('#eventsSelect option:selected').data('eventId'));
//   });
// };

// app.getTickets = function (id) {
//   id = id !== 'undefined' ? id : 1;

//   $('[data-tribune]').each(function () {
//     var $tribune = $(this);
//     $tribune.on('click touchstart', function () {
//       tribuneName = $tribune.data('tribune');
//       $exist = $('[data-popup-svg-elem=' + tribuneName + ']');

//       if ($exist.length === 1) {
//         $.fancybox.open($('[data-popup]'), {
//           baseClass: 'tribune-fancybox',
//           beforeShow: function () {
//             $('[data-popup-title]').text(tribuneName);
//             $('[data-popup-svg]').attr('data-popup-svg', tribuneName);
//             $exist.show();
//           },
//           afterClose: function () {
//             $('[data-popup-svg] svg').hide();
//           }
//         });

//         return;
//       }

//       app.startPreloading();

//       $.post('/getsectortickets', {
//         IDEvent: id,
//         SectorName: tribuneName
//       }, function (data) {
//         console.log(data);
//         if (data.TicketData.length > 0) {
//           var data = data.TicketData[0].row_to_json;

//           $.fancybox.open($('[data-popup]'), {
//             baseClass: 'tribune-fancybox',
//             beforeShow: function () {
//               $('[data-popup-title]').text(data.SectorRu);

//               $.get('../images/sectors/' + tribuneName + '.svg', null, function (svg) {
//                 $("svg", svg).prependTo($('[data-popup-svg]'));
//                 $('[data-popup-svg]').attr('data-popup-svg', tribuneName)
//                 $('[data-popup-svg] svg:first-child').attr('data-popup-svg-elem', tribuneName)

//                 app.tribuneSeatData();
//                 app.setDataForSeatTooltip(data);
//               }, 'xml');
//             },
//             afterShow: function () {
//               app.stopPreloading();
//             },
//             afterClose: function () {
//               $('[data-popup-svg] svg').hide();
//               //$('[data-popup-svg]').html('');
//             }
//           });
//         } else {
//           app.stopPreloading();
//           $.fancybox.open('<div class="popup t-a-c"><h2>Билетов в данной трибуне нет!</h2></div>', {
//             baseClass: 'tribune-fancybox',
//           });
//         }
//       }, 'json');
//     });
//   });
// };

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

app.setSeatsNumber = function (data) {
  var $wrapper = $('[data-popup-svg] svg g[data-line-start]');
  var sortSeatDirection = $wrapper.data('sort-seat-direction');
  var sortLineDirection = $wrapper.data('sort-line-direction');
  var sortSeatOption = $wrapper.data('sort-seat-option');
  var sortLineOption = $wrapper.data('sort-line-option');
  var lineStart = $wrapper.data('line-start');

  function _asc(a, b) {
    return a.index > b.index === 0 ? 0 : a.index > b.index ? 1 : -1;
  }

  function _desc(a, b) {
    return a.index < b.index === 0 ? 0 : a.index < b.index ? 1 : -1;
  }

  function _unpack(array) {
    var result = [];
    $.each(array, function() {
      result.push(this.elem);
    });
    return result;
  }

  var arrayLineSort = [];

  $('g', $wrapper).each(function () {
    var $line = $(this);
    var index = Math.round($('circle:first', $line).attr(sortLineOption));
    arrayLineSort.push({
      index: index,
      elem: $line[0]
    });
  });

  if (sortLineDirection === 'btt') {
    // bottom to top
    arrayLineSort.sort(_desc);
  } else {
    // top to bottom
    arrayLineSort.sort(_asc);
  }
  
  $wrapper.html(_unpack(arrayLineSort));

  // sort seats
  $('g', $wrapper).each(function (index) {
    var $line = $(this);
    var arraySeatSort = [];

    $line.attr('data-line', lineStart);

    $('circle', $line).each(function () {
      var $seat = $(this);
      var index = Math.round($seat.attr(sortSeatOption));
      arraySeatSort.push({
        index: index,
        elem: $seat[0]
      });
    });

    if (sortLineDirection === 'rtl') {
      // right to left
      arraySeatSort.sort(_asc);
    } else {
      // left to right
      arraySeatSort.sort(_desc);
    }

    $line.html(_unpack(arraySeatSort));

    $('circle', $line).each(function (index) {
      var $seat = $(this);
      $seat.attr('data-line', lineStart);
      $seat.attr('data-seat', index + 1);
    });

    lineStart++;
    $wrapper.attr('data-line-start', null);

    app.setSeatsData(data);
  });

  




    // list = $('.listitems > *').get();
    // $('.listitems').html('')

    // var listForSort = [];

    // $(list).each(function() {
    //   $elem = $(this);
    //   id = Math.round(+$elem.attr('cx'));
    //   listForSort.push({
    //     id: id,
    //     elem: $elem
    //   })
    // });

    // function sortList(a, b) {
    //   return a.id > b.id ? 1 : -1;
    // }

    // console.log(listForSort)
    // listForSort.sort(sortList)

    // var listNew = [];
    // $.each(listForSort, function() {
    //   listNew.push(this.elem)
    // })
    // console.log(listNew)
    // $('.listitems').html(listNew)





    // var $line = $(this);
    // var line = $line.attr('data-line');

    // $('circle', this).each(function (seat) {
    //   $(this).attr('data-line', line);
    //   $(this).attr('data-seat', seat + 1);
    // });

    // $line.attr('data-line', null);
};

app.showTooltip = function () {
  $('.tooltip').addClass('show');
};

app.hideTooltip = function () {
  $('.tooltip').removeClass('show');
};

app.moveTooltip = function (e) {
  var $tooltip = $('.tooltip');

  app.showTooltip();
  app.setContentTooltip(this);

  var tooltipHeight = $tooltip.height() + 30;
  var diffY = window.innerHeight - e.clientY;
  var offsetTop = (diffY < tooltipHeight) ? tooltipHeight - diffY : 0;
  
  var tooltipWidth = $tooltip.width() + 30;
  var diffX = window.innerWidth - e.clientX;
  var offsetLeft = (diffX < tooltipWidth) ? tooltipWidth - diffX : 0;

  $tooltip.css({
    top: e.clientY + 15 - offsetTop,
    left: e.clientX + 10 - offsetLeft
  });
};

app.setListenerTooltip = function (e) {
  $tooltips = $('[data-show-tooltip=init-wait]');
  $tooltips.attr('data-show-tooltip', 'ready');
  $tooltips.on('touchstart', app.showTooltip);
  $tooltips.on('mousemove touchstart', app.moveTooltip);
  $tooltips.on('mouseleave', app.hideTooltip);
};

app.setContentTooltip = function (elem, checkHover) {
  var $tooltip = $('.tooltip');
  var $elem = $(elem);
  var data = $elem.data('tooltip');
  var inCart = $elem.data('inCart');

  if (!$elem.data('hover') && checkHover) {
    return;
  }

  function _set(name, value) {
    if (value) {
      $('[data-tooltip-bind=' + name + ']').text(value);
    }

    $('[data-tooltip-bind=' + name + ']').show();
  }

  $tooltip.attr('data-style', null);
  $('[data-tooltip-bind]').hide();

  if (data.type === 'tribune') {
    if (!data.available) {
      _set('unavailable');
      _set('unavailable-tribune');
      _set('tip-seats-unavailable');
    } else {
      _set('price-range');
      _set('price-range-min', data.minPrice);
      _set('price-range-max', data.maxPrice);
      _set('tip-seats-available');
      _set('seats-available', data.seatsLeft);
    }

    _set('title', data.title);
  }

  if (data.type === 'seat') {
    if (data.status === 1) {
      _set('unavailable');
      _set('unavailable-seat');
    }

    if (data.status === 2) {
      _set('unavailable');
      _set('order-seat');
      _set('tip-seat-order');
    }

    if (data.status === 3) {
      if (inCart) {
        _set('tip-unselect');
        $tooltip.attr('data-style', 'in-cart');
      } else {
        _set('tip-select');
      }

      _set('price');
      _set('price-seat', data.price);
    }

    _set('seat-info');
    _set('line', data.line);
    _set('seat', data.seat);
    _set('title', data.title);
  }

  if (data.type === 'loading') {
    $tooltip.attr('data-style', 'loading');
  }
};

// app.setDataForTribuneTooltip = function (id) {
//   var id = (id !== 'undefined') ? id : 1;

//   $('[data-tribune]').each(function (index) {
//     var $tribune = $(this);
//     var tribuneName = $tribune.data('tribune');

//     if (index > 885) return;

//     $.post('/getsectortickets', {
//       IDEvent: id,
//       SectorName: tribuneName
//     }, function (res) {
//       $tribune.attr('data-load', true);

//       if (res.TicketData.length === 0) return;

//       data = res.TicketData[0].row_to_json
//       available = data.seatsLeft > 0 ? true : false;

//       $tribune.attr('data-show-tooltip', 'init-wait');
//       $tribune.attr('data-available', available);
//       $tribune.data('tooltip', {
//         type: 'tribune',
//         available: available,
//         title: data.SectorRu,
//         maxPrice: data.maxPrice,
//         minPrice: data.minPrice,
//         seatsLeft: data.seatsLeft
//       });

//       app.setListenerTooltip();
//     });

//   });
// };


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

app.setSeatsData = function (data) {
  $('[data-seat]:not([data-init])').each(function (index) {
    var $seat = $(this);
    var line = $seat.data('line');
    var seat = $seat.data('seat');
    var seatData;

    data.sector_rows.forEach(function (row) {
      if (row.RowN === line) {
        seatData = row.tickets[seat - 1];
      }
    });

    //console.log($seat, line, seat,  data.sector_rows, seatData);

    $seat.attr('data-show-tooltip', 'init-wait');
    $seat.attr('data-status', seatData.IDStatus);

    $seat.data('data', seatData);
    $seat.data('inCart', false);
    $seat.data('tooltip', {
      type: 'seat',
      status: seatData.IDStatus,
      title: seatData.SectorRu,
      price: '' + seatData.Price,
      seat: seatData.SeatN,
      line: seatData.RowN
    });

    $seat.on('click', app.handlerForAvaliableSeats);

    $seat.attr('data-init', true);

  });

  app.setListenerTooltip();
};

app.handlerForAvaliableSeats = function () {
  var $seat = $(this);
  var tooltip = $seat.data('tooltip');
  var data = $seat.data('data');
  var inCart = $seat.data('inCart');

  if (inCart) {
    app.removeFromCart(data, $seat);
  } else {
    app.addToCart(data, $seat);
  }

  app.setContentTooltip($seat);
}

app.addToCart = function(ticket, $seat) {
  var $cart = $('.cart');

  $cart.addClass('open');
  $seat.addClass('in-cart');
  $seat.data('inCart', true);

  app.cart.tickets.push(ticket);
  app.cart.total += ticket.Price;

  $('#cart-ticket [data-cart=tribune]').text(ticket.SectorRu);
  $('#cart-ticket [data-cart=line]').text(ticket.RowN);
  $('#cart-ticket [data-cart=seat]').text(ticket.SeatN);
  $('[data-cart=total]').text(app.cart.total);

  var addedTicket = $('.cart__tickets').prepend($('#cart-ticket').html())[0].children[0];

  $(addedTicket).on('mouseenter', function() {
    $seat.addClass('active');
    $('[data-tribune=' + ticket.SectorName + ']').addClass('active');
  });
  
  $(addedTicket).on('mouseleave', function() {
    $seat.removeClass('active');
    $('[data-tribune=' + ticket.SectorName + ']').removeClass('active');
  });
  
  $('[data-cart=remove]', addedTicket).on('click', function() {
    app.removeFromCart(ticket, $seat);
  });

  $(addedTicket).data('data', ticket);
  $(addedTicket).attr('data-cart-id', ticket.IDSeat);
  
  console.log(ticket)
}

app.removeFromCart = function(ticket, $seat) {
  var $cart = $('.cart');

  $seat.toggleClass('in-cart');
  $seat.data('inCart', false);
  $seat.removeClass('active');
  $('[data-tribune=' + ticket.SectorName + ']').removeClass('active');

  app.cart.total -= ticket.Price;
  $('[data-cart=total]').text(app.cart.total);

  app.cart.tickets.forEach(function(elem, index) {
    if (elem.IDSeat === ticket.IDSeat) {
      app.cart.tickets.splice(index, 1);
    }
  });

  $('[data-cart-id=' + ticket.IDSeat + ']').remove();

  if (!app.cart.tickets.length) {
    $cart.removeClass('open');
  }

  console.log(ticket, $seat)
}


// BETA --------------------------------

app.reserve = function(){
  if ( app.cart.tickets.length > 0 ){
    console.log(app.cart.tickets);
    var tickets = [];
    app.cart.tickets.forEach((item, i, array) => { tickets.push(item.TicketID) })
    $.post('/kassa/beta/ticket/reserve', {
      IDEvent: app.id,
      tickets: tickets
    }, function (res) {
      console.log(res)
    });
  }
  else console.log('cart is empty');
}


// -------------------------------------