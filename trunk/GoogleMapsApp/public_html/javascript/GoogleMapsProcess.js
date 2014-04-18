var map;
var count="1";
var directionsDisplay;
var directionsService = new google.maps.DirectionsService();

var bars = new Array();

function initialize() {
	directionsDisplay = new google.maps.DirectionsRenderer();
  var BTSAri = new google.maps.LatLng(13.779898, 100.544686);
  var mapOptions = {
    zoom: 15,
    center: BTSAri
  };
   map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
   directionsDisplay.setMap(map);
  var input = document.getElementById('address');
  var input2 = document.getElementById('address2');
  var searchBox = new google.maps.places.SearchBox((input));
  var searchBox2 = new google.maps.places.SearchBox(input2);

  google.maps.event.addListener(map, 'click', function showAlert(event) {
	    placeMarker(event.latLng,map);
	    window.alert("You have clicked on \nLatitude : "+event.latLng.lat().toString()
	    +"\nLongitude : "+event.latLng.lng().toString());
	    bars.push(event.latLng.lat()+", "+event.latLng.lng());
	});
}

function calcRoute() {
  var start = document.getElementById('address').value;
  var end = document.getElementById('address2').value;
  
  var wps = [];
  for(var i=0;i<bars.length;i++){
  	wps.push({location:bars[i],stopover:true});
  }
  var request = {
      origin:start,
      destination:end,
      waypoints:wps,
      optimizeWaypoints:true,
      travelMode: google.maps.TravelMode.DRIVING
  };
  
  directionsService.route(request, function(response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(response);
    }
  });
}

function placeMarker(position,map){
	infoWindow = new google.maps.InfoWindow({
		content:count.toString(),
		position: position,
		map: map
	});
	count++;
}

function clearDirection() {
  directionsDisplay.setMap(null);
  initialize();
  count = 1;
}

google.maps.event.addDomListener(window, 'load', initialize);