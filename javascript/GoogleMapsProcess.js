var map;
var count="0";
var directionsDisplay;
var directionsService = new google.maps.DirectionsService();
var points = new Array();
var waypointMarkers = [];
var checkroute = false;
var filename="Untitled Map";
var availableTags;

function initialize() {
    directionsDisplay = new google.maps.DirectionsRenderer();
    var BTSAri = new google.maps.LatLng(13.779898, 100.544686);
    var mapOptions = {
        zoom: 12,
        center: BTSAri
    };
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById('directions-panel'));
    markers = [];
    $(document).ready(function() {
        $('#filename').editable('../php/test2.php',{
            cssclass : 'Text2',
            indicator : 'Saving...',
            tooltip   : 'Click to edit.',
            type : 'text',
            onblur : 'submit',
            id : 'test',
            name : 'newvalue',
            callback : function(value,settings){
                filename = value;
            }
        });
    });
    var input = document.getElementById('address');
    var searchBox = new google.maps.places.SearchBox(input);

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
      
  google.maps.event.addListener(map, 'click', function showAlert(event) {
      placeMarker(event.latLng,map);
      points.push(event.latLng.lat()+","+event.latLng.lng());
      addWaypointToList();
  });
}

function shRoute(){
  checkroute = true; 
  calcRoute();
}

function azRoute(){
  checkroute = false;
  calcRoute();
}

function calcRoute() {
//  var start = document.getElementById('address').value;
  var wps = [];
  for(var i=1;i<points.length-1;i++){
      wps.push({location:points[i],stopover:true});
  }
  var request = {
      origin:points[0],
      destination:points[points.length-1],
      waypoints:wps,
      optimizeWaypoints:checkroute,
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
        index = points.indexOf(event.latLng.lat()+","+event.latLng.lng());
    });
//      หลังจาก drag marker เสร็จจะอัพเดตพิกัดของ waypoint ใน listbox 
//      พร้อมอัพเดตค่าที่เก็บไว้ใน array points ด้วย
    google.maps.event.addListener(marker,'dragend',function(event) {
        points[index] = event.latLng.lat()+","+event.latLng.lng();
        var list = $("#list").find("li");
        list.eq(index+1).text("Waypoint "+(index+1)+": "+points[index]);
    });
//      ใส่ listener เมื่อคลิกขวาที่ตัว marker จะทำการลบ waypoint ของ markerนั้น ในlistbox
//      พร้อมลบค่าพิกัดที่เก็บใน point และเอาตัว marker ออกจากarray waypointMarkers
//      พร้อมลบ marker นั้นออกจากแมพ สุดท้ายลดค่าตัวแปร count ที่เอาไว้นับ waypoint ลงหนึ่ง
    google.maps.event.addListener(marker,"rightclick",function(event){
        var index = points.indexOf(event.latLng.lat()+","+event.latLng.lng());
        var waypoint = $("#list").find("li");
        //เปลี่ยนลำดับ waypoint ใน tag li ที่ index>index+1 จนถึง < length
        for(var i=index+2,li;li = waypoint.eq(i),i<waypoint.length;i++){
//            alert(i);
            $(li).text($(li).text().replace("Waypoint "+(i).toString(),"Waypoint "+(i-1).toString()));
//            alert(li.text());
            image = "../marker-icon-number/number_"+(i-1)+".png";
            waypointMarkers[i-1].set("id",i-1);
            waypointMarkers[i-1].setIcon(image);
        }
        waypoint.eq(index+1).remove();
        points.splice(index,1);
        waypointMarkers[index].setMap(null);
        waypointMarkers.splice(index,1);
        count--;
    });
}

//ทำงานเมื่อกดปุ่ม RESET จะทำการเริ่ม reset ค่า count,array points, ใหม่
//, ลบmarker ออกจากแผนที่ให้หมด
//และเคลียร์ค่า input ของ textbox พร้อมทั้งลด waypoint ที่เก็บใน listbox ทั้งหมด
function clearDirection() {
    directionsDisplay.setMap(null);
    directionsDisplay.setPanel(null);
    points = [];
    waypointMarkers  = [];
    count = 0;
    $('#address').val('');
    var list = $("#list").find("li");
    for(var i=list.length-1,li;li=list.eq(i),i>0;i--){
        li.remove();
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
       var nodes = $("#list").find("li");
       var nodes_length = nodes.length;
       for(var i=0,node;i<nodes_length,node=nodes[i];i++){
           if(node===this){
               map.setCenter(waypointMarkers[i-1].getPosition());
           }
       }
    });
    ul.appendChild(li);
}

function setFileName(name){
    filename = name;
}

function Save(){
    var route_type;
    if(checkroute){
        route_type = 1;
    }else
        route_type = 0;
    filename = filename.replace(/\s/g, "");
    $.ajax({
        type: "POST",
        url : "../php/save.php",
        data: ({name : filename,route_type : route_type,latlng: points}),
        success: function(){
            alert("Send file to save.php successful.");
        },
        error: function(xhr, status, error) {
            alert(xhr.responseText);
       }
    });
}
function Load(){
    var lat,lng;
    var points_temp = [];
    initialize();
    for(var i=0;i<points.length;i++){
        console.log(points[i]);
        points_temp.push(points[i]);
    }
    points = [];
    for(var i=0;i<points_temp.length;i++){
        points.push(points_temp[i]);
        lat = points[i].split(",")[0];
        lng = points[i].split(",")[1];
        placeMarker(new google.maps.LatLng(lat,lng),map);
        addWaypointToList();
    }
    //calcRoute();
}

function initLoad(){
    var field,row;
    var name=[],route_type=[],date=[],points_array;
    clearDirection();
    $.ajax({
        url: "../php/load.php",
        success: function(d){
            row = d.split("|");
            points_array = new Array(row.length-1);
            for(var i=0;i<row.length-1;i++){
                field = row[i].split(":");
                name.push(field[0]);
                route_type.push(field[1]);
                date.push(field[2]);
                points_array[i] = new Array(field.length-3);
                for(var k=3;k<field.length;k++){
                    points_array[i][k-3] = field[k];
                }
            }
            $('#selectable').find("li").remove();
            for(var i=0;i<name.length;i++){
                var li = document.createElement("li");
                var route;
                $(li).append(date[i]+" ");
                if(route_type[i]==0){
                    route = "A-Z"
                    $(li).append(route+" ");
                }else{
                    route = "Fast "
                    $(li).append(route);
                }
                $(li).append(name[i]);
                li.setAttribute("class","ui-widget-content");
                li.setAttribute("style","text-align: left;word-spacing: 20px;");
                $("ol").append(li);
            }
            availableTags = $("#selectable>li").map(function(){
                return $(this).text();
            }).get();
            $( "#t" ).autocomplete({
                source: availableTags
            });
            $("#selectable").selectable({
                selected: function(event, ui) { 
                    var index = $(ui.selected).index();
                    var number_of_points = points_array[index].length;
                    points = [];
                    for(var i=0;i<number_of_points;i++){
                        points[i] = points_array[index][i];
                    }
                }                   
            });
        }
    });
}

// This default onbeforeunload event
//window.onbeforeunload = function(){
//    return "Do you want to leave?"
//}
//
//// A jQuery event (I think), which is triggered after "onbeforeunload"
//$(window).unload(function(){
//    //I will call my method
//});

google.maps.event.addDomListener(window, 'load', initialize);