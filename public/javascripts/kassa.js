$(document).ready(function(){
	var minutesLabel = document.getElementById("minutes");
	var secondsLabel = document.getElementById("seconds");
	var hoursLabel   = document.getElementById("hours");

	function getCookie(name) {
	  var matches = document.cookie.match(new RegExp(
	    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
	  ));
	  return matches ? decodeURIComponent(matches[1]) : undefined;
	}
	function setCookie(name, value){
		document.cookie = name + "=" + value;
	}
	function setTime() {
	  ++totalSeconds;
	  var totalSeconds = parseInt(getCookie('session')) + 1;
	  setCookie('session', totalSeconds);
	  secondsLabel.innerHTML = pad(totalSeconds % 60);
	  minutesLabel.innerHTML = pad(parseInt(totalSeconds / 60));
	  hoursLabel.innerHTML   = pad(parseInt((totalSeconds / 60) / 60));
	}

	function pad(val) {
	  var valString = val + "";
	  if (valString.length < 2) {
	    return "0" + valString;
	  } else {
	    return valString;
	  }
	}

	if ( !getCookie('session') ){
		setCookie('session', 0);
	}

	setInterval(setTime, 1000);

	$('.exit-button').click(function(){
		setCookie('session', 0);
		window.location.href="/exit";
	})


})