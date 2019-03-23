var parts = window.location.href.split("/");
var result = parts[parts.length - 1];

app = {};

app.id = result;

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
  var svgStartOffsetX =
    (body.width / 2) * (1 + svgStartZoom) -
    (stadiumRect.width * svgStartZoom) / 2 -
    body.width * 0.0732;

  var zoom = panzoom(stadium, {
    smoothScroll: false,
    maxZoom: 2,
    minZoom: 0.3,
    zoomSpeed: 0.25
  });

  zoom.zoomAbs(svgStartOffsetX, 0, svgStartZoom);

  zoom.on('panstart', function () {
    $(stadium).addClass('draggable');
  });

  zoom.on('panend', function () {
    $(stadium).removeClass('draggable');
  });

  // app.zoomTribune(zoom);
  app.tribuneInit();
  app.stopPreloading();
};

app.tribuneInit = function () {
  // once request data than hover on tribune
  $('[data-tribune]').on('mouseenter touchstart', function () {
    var $tribune = $(this);
    var tribuneName = $tribune.data('tribune');
    var tribuneData = $tribune.data('tooltip');
    app.currentHoverTribune = $tribune;

    $('[data-tribune]').data('hover', false);
    $tribune.data('hover', true);

    if (tribuneData) {
      return;
    }

    $tribune.attr('data-show-tooltip', 'init-wait');
    $tribune.data('tooltip', {
      type: 'loading'
    });
    app.setListenerTooltip();

    $.post(
      '/getsectortickets', {
        IDEvent: app.id,
        SectorName: tribuneName
      },
      function (res) {
        if (res.TicketData.length === 0) {
          console.error('Ошибка на сервере', res);
          $tribune.remove();
          return;
        }

        var data = res.TicketData[0].row_to_json;
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
      }
    );
  });
};

app.showTribuneSeats = function () {
  var $tribune = $(this);
  var data = $tribune.data('data');

  $.fancybox.open($('[data-popup]'), {
    baseClass: 'tribune-fancybox',
    beforeShow: _showSvg,
    afterClose: _hideSvg,
    afterShow: app.stopPreloading
  });

  function _showSvg() {
    var $exist = $('[data-popup-svg-elem=' + data.SectorName + ']');

    $('[data-popup-title]').text(data.SectorRu);
    $('[data-popup-svg]').attr('data-popup-svg', data.SectorName);

    if ($exist.length === 1) {
      $exist.show();
    } else {
      app.startPreloading();
      $.get(
        '/images/sectors/' + data.SectorName + '.svg',
        null,
        function (svg) {
          $('svg', svg).prependTo($('[data-popup-svg]'));
          $('[data-popup-svg] svg:first-child').attr(
            'data-popup-svg-elem',
            data.SectorName
          );

          app.setSeatsNumber(data);
        },
        'xml'
      );
    }
  }

  function _hideSvg() {
    $('[data-popup-svg] svg').hide();
  }
};

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
      'font-size': Math.min(($(window).width() / baseWidth) * baseSize, 10) + 'px'
    });

    
    //------- beta

    $('.priceChange-exec').click(function(){
      app.changeprice();
    })

     $('.cart__buy').on('click', function() {
      $('body').removeClass('cart--is-open');
      $.fancybox.close();
      $('#modalPrice').modal('show');
    });

     //------------
  }
};

app.startPreloading = function () {
  $('[data-preloader]').removeClass('hidden');
  $('html').css('overflow', 'hidden');
};

app.stopPreloading = function () {
  $('[data-preloader]').addClass('hidden');
  $('html').css('overflow', 'visible');
};

app.setSeatsNumber = function (data) {
  var $wrapper = $('[data-popup-svg] svg g[data-line-start]');
  var sortSeatDirection = $wrapper.data('sort-seat-direction');
  var sortLineDirection = $wrapper.data('sort-line-direction');
  var sortSeatOption = $wrapper.data('sort-seat-option');
  var sortLineOption = $wrapper.data('sort-line-option');
  var lineStart = $wrapper.data('line-start');
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
  });

  app.setSeatsData(data);

  function _asc(a, b) {
    return a.index > b.index === 0 ? 0 : a.index > b.index ? 1 : -1;
  }

  function _desc(a, b) {
    return a.index < b.index === 0 ? 0 : a.index < b.index ? 1 : -1;
  }

  function _unpack(array) {
    var result = [];
    $.each(array, function () {
      result.push(this.elem);
    });
    return result;
  }
};

app.showTooltip = function () {
  $('.tooltip').addClass('show');
};

app.hideTooltip = function () {
  $(this).data('update', true);
  $('.tooltip').removeClass('show');
};

app.moveTooltip = function (e) {
  var $tooltip = $('.tooltip');

  app.showTooltip();
  app.setContentTooltip(this);

  var tooltipHeight = $tooltip.height() + 30;
  var diffY = window.innerHeight - e.clientY;
  var offsetTop = diffY < tooltipHeight ? tooltipHeight - diffY : 0;

  var tooltipWidth = $tooltip.width() + 30;
  var diffX = window.innerWidth - e.clientX;
  var offsetLeft = diffX < tooltipWidth ? tooltipWidth - diffX : 0;

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

  var update = $elem.data('update');
  // if (update === false) return;
  $elem.data('update', false)

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

app.setSeatsData = function (data) {
  var priceIndex = {};
  data = data.sector_rows;
  /*data.forEach(function(row){
    var $line = $('g[data-line="'+row.RowN+'"]'),
        $number = '<svg><text x="10" y="10" font-size="5" fill="rgb(62, 61, 61);">'+row.RowN+'</text></svg>';
    $line.append($number);
  });*/

  var colors = [];
  $.ajax({
    url: '/colors/get/byevent/' + app.id,
    type: 'GET',
    async: false
  }).done(function(data) {
     console.log(data);
    colors = data;
  }).fail(function(xhr)  {
     // Todo something..
  });
  //  $.get(
  //   '/colors/get/byevent/' + app.id,
  //   null,
  //    (data) => {
  //     colors = data;
  //   }, false
  // );

  for (var i = 0; i < data.length; ++i) {
    for (var i2 = 0; i2 < data[i].tickets.length; ++i2) {
      var seatData = data[i].tickets[i2];
      var $seat = $('[data-seat]:not([data-init])[data-line=' + seatData.RowN + '][data-seat=' + seatData.SeatN + ']');
      $seat.attr('data-show-tooltip', 'init-wait');
      $seat.attr('data-status', seatData.IDStatus);
      $seat.attr('data-price', seatData.Price);
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
   
      $seat.each(function() {
        
       
        for(var i = 0;i < colors.length; i++){
          if($(this).data('price') == parseInt(colors[i].Price)){
            $(this).css('fill', colors[i].Color);
            break;
          }
        }
      });

      if (seatData.IDStatus === 3) {
        $seat.on('click', app.handlerForAvaliableSeats);
      }

      $seat.attr('data-init', true);
    }
  }


  // $('[data-seat]:not([data-init])').each(function () {
  //   var $seat = $(this);
  //   var line = $seat.data('line');
  //   var seat = $seat.data('seat');
  //   var seatData;

  //   for (var i = 0; i < data.length; ++i) {
  //     if (data[i].RowN === line) {
  //       seatData = data[i].tickets[seat - 1];
  //       if (seatData !== undefined) {
  //         priceIndex[seatData.Price] = true;
  //       }
  //       break;
  //     }
  //   }

  //   if (seatData == undefined) {
  //     console.error($seat, line, seat, data, seatData);
  //     return;
  //   }

  //   $seat.attr('data-show-tooltip', 'init-wait');
  //   $seat.attr('data-status', seatData.IDStatus);
  //   $seat.attr('data-price', seatData.Price);

  //   $seat.data('data', seatData);
  //   $seat.data('inCart', false);
  //   $seat.data('tooltip', {
  //     type: 'seat',
  //     status: seatData.IDStatus,
  //     title: seatData.SectorRu,
  //     price: '' + seatData.Price,
  //     seat: seatData.SeatN,
  //     line: seatData.RowN
  //   });

  //   if (seatData.IDStatus === 3) {
  //     $seat.on('click', app.handlerForAvaliableSeats);
  //   }

  //   $seat.attr('data-init', true);
  // });

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
};

app.addToCart = function (ticket, $seat) {
  var $cart = $('.cart');

  if (app.cart.tickets.length >= 8) {
    return;
  }

  $('body').addClass('cart--is-open');
  $seat.addClass('in-cart');
  $seat.data('inCart', true);

  app.cart.tickets.push(ticket);
  app.cart.total += ticket.Price;

  $('#cart-ticket [data-cart=tribune]').text(ticket.SectorRu);
  $('#cart-ticket [data-cart=line]').text(ticket.RowN);
  $('#cart-ticket [data-cart=seat]').text(ticket.SeatN);
  $('[data-cart=total]').text(app.cart.total);

  $('.cart__tickets').append($('#cart-ticket').html());
  var addedTicket = $('.cart__tickets .cart__ticket:last-child')

  $seat.data('itemCart', addedTicket);

  $seat.on('mouseenter', function () {
    $(addedTicket).addClass('active');
  });
  $(addedTicket).addClass('active');

  $seat.on('mouseleave', function () {
    $(addedTicket).removeClass('active');
  });

  $(addedTicket).on('mouseenter', function () {
    $seat.addClass('active');
    $('[data-tribune=' + ticket.SectorName + ']').addClass('active');
  });

  $(addedTicket).on('mouseleave', function () {
    $seat.removeClass('active');
    $('[data-tribune=' + ticket.SectorName + ']').removeClass('active');
  });

  $('[data-cart=remove]', addedTicket).on('click', function () {
    app.removeFromCart(ticket, $seat);
  });

  $(addedTicket).data('data', ticket);
  $(addedTicket).attr('data-cart-id', ticket.IDSeat);

  console.log(ticket);
 
};

app.removeFromCart = function (ticket, $seat) {
  var $cart = $('.cart');

  $seat.toggleClass('in-cart');
  $seat.data('inCart', false);
  $seat.removeClass('active');
  $('[data-tribune=' + ticket.SectorName + ']').removeClass('active');

  app.cart.total -= ticket.Price;
  $('[data-cart=total]').text(app.cart.total);

  app.cart.tickets.forEach(function (elem, index) {
    if (elem.IDSeat === ticket.IDSeat) {
      app.cart.tickets.splice(index, 1);
    }
  });

  $('[data-cart-id=' + ticket.IDSeat + ']').remove();

  if (!app.cart.tickets.length) {
    $('body').removeClass('cart--is-open');
  }

  console.log(ticket, $seat);
};

/*$('.cart__buy').on('click', function () {
  $.post(
    '/sendsaledtickets2', {
      IDEvent: app.id,
      Seats: [{
        SectorName: "W7top",
        RowN: 1,
        SeatN: 1,
        Price: 3500
      }]
    },
    function (res) {
      console.log(res)
    });
});*/



app.changeprice = function(){
  console.log(app.cart.tickets);
  if ( app.cart.tickets.length > 0 ){
    console.log(app.cart.tickets);
    var tickets = [];
    app.cart.tickets.forEach((item, i, array) => { tickets.push(item.TicketID) })
    $.post('/admin/tickets/new/changeprice', {
          IDEvent: app.id,
          tickets: tickets,
          price: $('.newPrice').val()
        }, function (ans) {
           if ( ans.success ) { 

            $.fancybox.close();
           
            setTimeout(function(){
               window.location.reload(1);
            }, 200);
            
          }
           else { alert("Произошла какая-то ошибка, попробуйте еще раз!"); console.log(ans) }
        });
       

  }
  else console.log('cart is empty');
}


// -------------------------------------