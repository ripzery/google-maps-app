var map;
var count="1";
var directionsDisplay;
var directionsService = new google.maps.DirectionsService();
var points = new Array();

function initialize() {
	directionsDisplay = new google.maps.DirectionsRenderer();
  var BTSAri = new google.maps.LatLng(13.779898, 100.544686);
  var mapOptions = {
    zoom: 12,
    center: BTSAri
  };
   map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
   directionsDisplay.setMap(map);
   
  markers = [];
  
  var input = document.getElementById('address');
  var input2 = document.getElementById('address2');
  var searchBox = new google.maps.places.SearchBox(input);
  var searchBox2 = new google.maps.places.SearchBox(input2);

  google.maps.event.addListener(searchBox, 'places_changed', function() {
    var places = searchBox.getPlaces();

    for (var i = 0, marker; marker = markers[i]; i++) {
      marker.setMap(null);
    }

    // For each place, get the icon, place name, and location. 
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0, place; place = places[i]; i++) {
      var image = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25)
      };

      // Create a marker for each place.
      var marker = new google.maps.Marker({
        map: map,
        icon: image,
        title: place.name,
        position: place.geometry.location
      });

      markers.push(marker);

      bounds.extend(place.geometry.location);
    }

    map.fitBounds(bounds);
  });
  
  google.maps.event.addListener(searchBox2, 'places_changed', function() {
    var places = searchBox2.getPlaces();

    for (var i = 0, marker; marker = markers[i]; i++) {
      marker.setMap(null);
    }

    // For each place, get the icon, place name, and location. 
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0, place; place = places[i]; i++) {
      var image = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25)
      };

      // Create a marker for each place.
      var marker = new google.maps.Marker({
        map: map,
        icon: image,
        title: place.name,
        position: place.geometry.location
      });

      markers.push(marker);

      bounds.extend(place.geometry.location);
    }

    map.fitBounds(bounds);
  });
    
  /*google.maps.event.addListener(map, 'bounds_changed', function() {
        var bounds = map.getBounds();
        searchBox.setBounds(bounds);
      });*/
  
  google.maps.event.addListener(map, 'click', function showAlert(event) {
	    placeMarker(event.latLng,map);
	    window.alert("You have clicked on \nLatitude : "+event.latLng.lat().toString()
	    +"\nLongitude : "+event.latLng.lng().toString());
	    points.push(event.latLng.lat()+", "+event.latLng.lng());
            addWaypointToList();
	});
}

function calcRoute() {
  var start = document.getElementById('address').value;
  var end = document.getElementById('address2').value;
  
  var wps = [];
  for(var i=0;i<points.length;i++){
  	wps.push({location:points[i],stopover:true});
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
  point = [];
  count = 1;
  document.getElementById('address').value = '';
  document.getElementById('address2').value = '';
  initialize();
}

function addWaypointToList(){
    var ul = document.getElementById("list");
    var li = document.createElement("li");
    li.appendChild(document.createTextNode("Waypoint "+(count-1)+": "+points[points.length-1]));
    ul.appendChild(li);
}

google.maps.event.addDomListener(window, 'load', initialize);