var map;
var count="0";
var directionsDisplay;
var directionsService = new google.maps.DirectionsService();
var points = new Array();
var waypointMarkers = [];

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
//	    window.alert("You have clicked on \nLatitude : "+event.latLng.lat().toString()
//	    +"\nLongitude : "+event.latLng.lng().toString());
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
    var image = "../marker-icon-number/number_"+(parseInt(count)+1)+".png";
    var marker = new google.maps.Marker();
    marker.set("map",map);
    marker.set("position",position);
    marker.set("id",count);
    marker.set("icon",image);
    marker.set("draggable",true);
    marker.set("animation",google.maps.Animation.DROP);
    waypointMarkers[marker.id] = marker;
    count++;

    var index;
//      เก็บพิกัดก่อนที่จะdrag marker เสร็จ เพื่อเอาพิกัดไปหาตำแหน่งที่เก็บใน array points ให้เจอก่อน
//      ค่อยเปลี่ยนพิกัดนั้นเป็นพิกัดใหม่หลังจาก drag เสร็จ
    google.maps.event.addListener(marker,'mousedown',function(event) {
        index = points.indexOf(event.latLng.lat()+", "+event.latLng.lng());
    });
//      หลังจาก drag marker เสร็จจะอัพเดตพิกัดของ waypoint ใน listbox 
//      พร้อมอัพเดตค่าที่เก็บไว้ใน array points ด้วย
    google.maps.event.addListener(marker,'dragend',function(event) {
        points[index] = event.latLng.lat()+", "+event.latLng.lng();
        var list = document.getElementsByTagName("li");
        list[index+1].innerHTML = "Waypoint "+(index+1)+": "+points[index];
    });
//      ใส่ listener เมื่อคลิกขวาที่ตัว marker จะทำการลบ waypoint ของ markerนั้น ในlistbox
//      พร้อมลบค่าพิกัดที่เก็บใน point และเอาตัว marker ออกจากarray waypointMarkers
//      พร้อมลบ marker นั้นออกจากแมพ สุดท้ายลดค่าตัวแปร count ที่เอาไว้นับ waypoint ลงหนึ่ง
    google.maps.event.addListener(marker,"rightclick",function(event){
        var index = points.indexOf(event.latLng.lat()+", "+event.latLng.lng());
        var list = document.getElementsByTagName("li")[index+1].parentNode;
        var waypoint = document.getElementsByTagName("li");
        
        //เปลี่ยนลำดับ waypoint ใน tag li ที่ index>index+1 จนถึง < length
        for(var i=index+2,li;li = waypoint[i],i<waypoint.length;i++){
            li.innerHTML = li.innerHTML.replace("Waypoint "+(i).toString(),"Waypoint "+(i-1).toString());
            image = "../marker-icon-number/number_"+(i-1)+".png";
            waypointMarkers[i-1].set("id",i-2);
            waypointMarkers[i-1].setIcon(image);
        }
        
        list.removeChild(waypoint[index+1]);
        points.splice(index,1);
        count--;
        waypointMarkers[index].setMap(null);
        waypointMarkers.splice(index,1);
    });
}

//ทำงานเมื่อกดปุ่ม RESET จะทำการเริ่ม reset ค่า count,array points, ใหม่
//, ลบmarker ออกจากแผนที่ให้หมด
//และเคลียร์ค่า input ของ textbox พร้อมทั้งลด waypoint ที่เก็บใน listbox ทั้งหมด
function clearDirection() {
  directionsDisplay.setMap(null);
  points = [];
  waypointMarkers  = [];
  count = 0;
  document.getElementById('address').value = '';
  document.getElementById('address2').value = '';
  var list = document.getElementsByTagName('li');
  for(var i=list.length-1,li;li=list[i],i>0;i--){
      li.parentNode.removeChild(li);
  }
  initialize();
}

//เมื่อสร้าง marker หลังจากคลิ๊กบนแผนที่แล้วก็จะบันทึกพิกัดของ waypoint ลงใน textbox
function addWaypointToList(){
    var ul = document.getElementById("list");
    var li = document.createElement("li");
    var position = points[points.length-1];
    li.appendChild(document.createTextNode("Waypoint "+(points.indexOf(position)+1)+": "+position));
    li.addEventListener('click',function(){
       var pos = this.innerHTML.split(" ");
       var nodes = document.getElementsByTagName("li");
       for(var i=0,node;i<nodes.length,node=nodes[i];i++){
           if(node===this){
               map.setCenter(waypointMarkers[i-1].getPosition());
           }
       }
    });
    ul.appendChild(li);
}

// This default onbeforeunload event
window.onbeforeunload = function(){
    return "Do you want to leave?"
}

// A jQuery event (I think), which is triggered after "onbeforeunload"
$(window).unload(function(){
    //I will call my method
});

google.maps.event.addDomListener(window, 'load', initialize);