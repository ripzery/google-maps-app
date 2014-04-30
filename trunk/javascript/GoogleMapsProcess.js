var map;
var count="0";
var directionsDisplay;
var directionsService;
var points = new Array();
var waypointMarkers = [];
var checkroute = false;
var filename="UntitledMap";
var availableTags;
var checktab2 = 0;
var callroute = false;
var service;
var pick_r = 0;
var option = {draggable : true};
var start_place,end_place;

function initialize() {
    directionsDisplay = new google.maps.DirectionsRenderer(option);
    var BTSAri = new google.maps.LatLng(13.779898, 100.544686);
    var mapOptions = {
        zoom: 12,
        center: BTSAri
    };
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById('directions-panel'));
    markers = [];
    addTable();
    $.ajax({
       type : "POST",
       url : "../php/check.php",
       data : {name : "UntitledMap"},
       success : function(return_value){
           $('#filename').text(return_value);
           filename = return_value;
       }
    });
    $(document).ready(function() {
        $('#filename').editable('../php/test2.php',{
            cssclass : 'Text2',
            indicator : 'Saving...',
            tooltip   : 'Click to edit.',
            type : 'text',
            onblur : 'submit',
            id : 'test',
            name : 'newvalue',
            success : function(return_name){
                filename = return_name;
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
    service = new google.maps.places.PlacesService(map);  
    google.maps.event.addListener(map, 'click', function showAlert(event) {
      placeMarker(event.latLng,map);
      points.push(event.latLng.lat()+","+event.latLng.lng());
      addWaypointToList();
      if(callroute && points.length >2){
            calcRoute();
        }
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
  callroute = true;
  directionsService = new google.maps.DirectionsService();
  if(points.length===1){
      alert("Please enter end points.");
      return false;
  }else if(points.length===0){
      alert("Please enter start and end points.");
      return false;
  }
  var wps = [];
  for(var i=2;i<points.length;i++){
      wps.push({location:points[i],stopover:true});
  }
  var request = {
      origin:points[0],
      destination:points[1],
      waypoints:wps,
      provideRouteAlternatives : true,
      optimizeWaypoints:checkroute,
      travelMode: google.maps.TravelMode.DRIVING
  };
  
  directionsService.route(request, function(response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(response);
      directionsDisplay.setRouteIndex(parseInt(pick_r));
    }
  });
}

function placeMarker(position,map){
    var image;
    if(count==0){
        image = "../marker-icon-number/start.png";
    }
    else if(count==1){
        image = "../marker-icon-number/end.png";
    }
    else{
        image = "../marker-icon-number/number_"+(parseInt(count)-1)+".png";
    }
    var marker = new google.maps.Marker();
    marker.set("map",map);
    marker.set("position",position);
    marker.set("id",count);
    marker.set("icon",image);
    marker.set("draggable",true);
    //marker.set("animation",google.maps.Animation.DROP);
    waypointMarkers[marker.id] = marker;
    count++;
    var request = {
        location : position,
        types : ['establishment','gas_station','car_dealer','car_rental','car_repair','car_wash','department_store','shopping_mall','storage','parking'],
        rankBy : google.maps.places.RankBy.DISTANCE
    };
    service.nearbySearch(request,function(results,status){
        if (status == google.maps.places.PlacesServiceStatus.OK&&count<3){
            if(-1!==$("#list>li:nth-child(2)").text().indexOf(",")){
                start_place = results[0].name +" "+ results[0].vicinity;
                $("#list>li:nth-child(2)").text("Start : "+start_place);
            }
            else if(-1!==$("#list>li:last").text().indexOf(",")){
                end_place = results[0].name +" "+results[0].vicinity;
                $("#list>li:last").text("End : "+end_place);
            }
        }
    }); 
    var index;
//      เก็บพิกัดก่อนที่จะdrag marker เสร็จ เพื่อเอาพิกัดไปหาตำแหน่งที่เก็บใน array points ให้เจอก่อน
//      ค่อยเปลี่ยนพิกัดนั้นเป็นพิกัดใหม่หลังจาก drag เสร็จ
    google.maps.event.addListener(marker,'mousedown',function(event) {
        index = points.indexOf(event.latLng.lat()+","+event.latLng.lng());
        if(callroute){
            calcRoute();
        }
    });
//      หลังจาก drag marker เสร็จจะอัพเดตพิกัดของ waypoint ใน listbox 
//      พร้อมอัพเดตค่าที่เก็บไว้ใน array points ด้วย
    google.maps.event.addListener(marker,'dragend',function(event) {
        request.location = event.latLng;
        points[index] = event.latLng.lat()+","+event.latLng.lng();
        var list = $("#list").find("li");
        if(index===0){
            service.nearbySearch(request,function(results,status){
                if (status == google.maps.places.PlacesServiceStatus.OK) {
                    $("#list>li").eq(1).text("Start : " + results[0].name +" "+ results[0].vicinity);
                }
            });
            list.eq(index+1).text("Start : "+start_place);
        }
        else if(index===1){
            service.nearbySearch(request,function(results,status){
                if (status == google.maps.places.PlacesServiceStatus.OK) {
                    $("#list>li:last").text("End : " + results[0].name +" "+ results[0].vicinity);
                }
            });
            list.eq(points.length).text("End : "+end_place);
        }
        else{
            console.log(index-1);
            list.eq(index).text("Waypoint "+(index-1)+": "+points[index]);
        }
        if(callroute){
            calcRoute();
        }
    });
//      ใส่ listener เมื่อคลิกขวาที่ตัว marker จะทำการลบ waypoint ของ markerนั้น ในlistbox
//      พร้อมลบค่าพิกัดที่เก็บใน point และเอาตัว marker ออกจากarray waypointMarkers
//      พร้อมลบ marker นั้นออกจากแมพ สุดท้ายลดค่าตัวแปร count ที่เอาไว้นับ waypoint ลงหนึ่ง
    google.maps.event.addListener(marker,"rightclick",function(event){
        var index = points.indexOf(event.latLng.lat()+","+event.latLng.lng());
        var waypoint = $("#list").find("li");
//        alert(waypoint.length);
        //เปลี่ยนลำดับ waypoint ใน tag li ที่ index>index+1 จนถึง < length
        if(index===0 || index===1){
            clearMap();
        }
        else{
            for(var i=index+1,li;li = waypoint.eq(i),i<waypoint.length-1;i++){
    //            alert(i);
                $(li).text($(li).text().replace("Waypoint "+(i-1).toString(),"Waypoint "+(i-2).toString()));
    //            alert(li.text());
//                alert(index);
//                alert(i);
                image = "../marker-icon-number/number_"+(i-2)+".png";
                waypointMarkers[i].set("id",i-1);
                waypointMarkers[i].setIcon(image);
            }
//            alert(waypoint.eq(3).text());
            waypoint.eq(index).remove();
            points.splice(index,1);
            waypointMarkers[index].setMap(null);
            waypointMarkers.splice(index,1);
            count--;
        }
        if(callroute){
            calcRoute();
        }
    });
}
//ทำงานเมื่อกดปุ่ม RESET จะทำการเริ่ม reset ค่า count,array points, ใหม่
//, ลบmarker ออกจากแผนที่ให้หมด
//และเคลียร์ค่า input ของ textbox พร้อมทั้งลด waypoint ที่เก็บใน listbox ทั้งหมด
function clearMap() {
    directionsDisplay.setMap(null);
    directionsDisplay.setPanel(null);
    points = [];
    callroute = false;
    count = 0;
    $('#address').val('');
    for(var i=0;i<waypointMarkers.length;i++){
        waypointMarkers[i].setMap(null);
    }
    waypointMarkers  = [];
    var list = $("#list").find("li");
    for(var i=list.length-1,li;li=list.eq(i),i>0;i--){
        li.remove();
  }
    directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById('directions-panel'));
}
//เมื่อสร้าง marker หลังจากคลิ๊กบนแผนที่แล้วก็จะบันทึกพิกัดของ waypoint ลงใน textbox
function addWaypointToList(){
    var ul = document.getElementById("list");
    var li = document.createElement("li");
    var position = points[points.length-1];
    li.addEventListener('click',function(){
        var pos = this.innerHTML.split(" ");
        var nodes = $("#list").find("li");
        var nodes_length = nodes.length;
        if(this===nodes[1])
        {
            map.setCenter(waypointMarkers[0].getPosition());
        }else if(this===nodes[nodes.length-1]){
            map.setCenter(waypointMarkers[1].getPosition());
        }else{
            map.setCenter(waypointMarkers[$(nodes).index(this)].getPosition());
        }
    });
    if($("#list>li").length<2){
        li.appendChild(document.createTextNode("Start : "+position));
        ul.appendChild(li);
    }
    else if($("#list>li").length===2){
        li.appendChild(document.createTextNode("End : "+position));
        ul.appendChild(li);
    }
    else{
        li.appendChild(document.createTextNode("Waypoint "+(points.indexOf(position)-1)+": "+position));
        ul.insertBefore(li,ul.childNodes[ul.childNodes.length-1]);
    }
}

function Save(){
    var route_type;
    pick_r = directionsDisplay.getRouteIndex();
    alert(pick_r);
    if(checkroute){
        route_type = 1;
    }
    else{
        route_type = 0;
    }
    if(points.length<2){
        alert("Please insert start-end point.");
        return false;
    }
    filename = $('#filename').text();
    $.ajax({
        type: "POST",
        url : "../php/save.php",
        data: ({name : filename,route_type : route_type,pick_route : pick_r,latlng: points}),
        success: function(){
            alert("Send file to save.php successful.");
        },
        error: function(xhr, status, error) {
            alert(xhr.responseText);
       }
    });
    addTable();
}

function Load(){
    var lat,lng;
    var points_temp = [];
    directionsDisplay.setPanel(null);
    for(var i=0;i<points.length;i++){
        //console.log(points[i]);
        points_temp.push(points[i]);
    }
    clearMap();
    points = [];
    for(var i=0;i<points_temp.length;i++){
        points.push(points_temp[i]);
        lat = points[i].split(",")[0];
        lng = points[i].split(",")[1];
        placeMarker(new google.maps.LatLng(lat,lng),map);
        addWaypointToList();
    }
    calcRoute();
    //directionsDisplay.setRouteIndex(parseInt(pick_r));
    var request = {
        location : new google.maps.LatLng(points[0].split(",")[0],points[0].split(",")[1]),
        types : ['establishment','gas_station','car_dealer','car_rental','car_repair','car_wash','department_store','shopping_mall','storage','parking'],
        rankBy : google.maps.places.RankBy.DISTANCE
    };
    service.nearbySearch(request,function(results,status){
        if (status == google.maps.places.PlacesServiceStatus.OK){
            start_place = results[0].name +" "+ results[0].vicinity;
            $("#list>li:nth-child(2)").text("Start : "+start_place);
        }
    });
    request.location = new google.maps.LatLng(points[points.length-1].split(",")[0],points[points.length-1].split(",")[1]);
    service.nearbySearch(request,function(results,status){
        if (status == google.maps.places.PlacesServiceStatus.OK){
            end_place = results[0].name +" "+ results[0].vicinity;
            $("#list>li:last").text("End: "+end_place);
        }
    }); 
}

function initLoad(){
    var field,row;
    var name=[],route_type=[],pick_route=[],date=[],points_array;
    var sort_list = document.getElementById("combobox");
    var option_select;
    var value_selected = "Asc";
    $('#combobox').val("Asc");
    
    $.ajax({
        type :"POST",
        url: "../php/load.php",
        success: function(d){
            row = d.split("|");
            points_array = new Array(row.length-1);
            for(var i=0;i<row.length-1;i++){
                field = row[i].split(":");
                name.push(field[0]);
                route_type.push(field[1]);
                pick_route.push(field[2]);
                date.push(field[3]);
                points_array[i] = new Array(field.length-4);
                for(var k=4;k<field.length;k++){
                    points_array[i][k-4] = field[k];
                }
            }
            $('#selectable').find("li").remove();
            for(var i=0;i<name.length;i++){
                var li = document.createElement("li");
                var route;
                $(li).append(date[i]+" ");
                if(route_type[i]==0)
                {
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
            $(sort_list).on('change',function(e){
                option_select = $('#combobox>option:selected',this);
                value_selected = this.value;
//                alert(value_selected);
                $("ol").find('li').remove();
                if(value_selected==='Asc'){
                    //alert("This is ASC fn");
                    for(var i=0;i<name.length;i++){
                        var li = document.createElement("li");
                        var route;
                        $(li).append(date[i]+" ");
                        if(route_type[i]==0)
                        {
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
                }
                else{
                    for(var i=name.length-1;i>=0;i--){
                        var li = document.createElement("li");
                        var route;
                        $(li).append(date[i]+" ");
                        if(route_type[i]==0)
                        {
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
                }
            });
            var allMapsData = $("ol").find("li");
            $("#t").keyup(function(){
                var len = allMapsData.length;
                var string = $('#t').val();
                $('ol>li:not(:contains(' + $('#t').val() + '))').hide();
                $("ol>li:contains("+ string +")").show();
            });
            $("#selectable").selectable({
                selected: function(event, ui) { 
                    $(ui.selected).addClass("ui-selected").siblings().removeClass("ui-selected");
                    var index = $(ui.selected).index();
                    var number_of_points = points_array[index].length;
                    points = [];
                    for(var i=0;i<number_of_points;i++){
                        points[i] = points_array[index][i];
                    }
                    $('#filename').text(name[index]);
                    if(route_type[index]===1)
                    {
                        checkroute = true;
                    }else if(route_type[index]===0){
                        checkroute = false;
                    }
                    pick_r = pick_route[index];
                }                   
            });
            $("#t").keydown(function(e){
                if(e.keyCode===13&&$("#selectable>li").hasClass('ui-selected')){
                    var index = $(".ui-selected").index();
                    var number_of_points = points_array[index].length;
                    points = [];
                    for(var i=0;i<number_of_points;i++){
                        points[i] = points_array[index][i];
                    }
                    $( "#dialog" ).dialog("close");
                    $('ol>li').removeClass('ui-selected');
                    $('#filename').text(name[index]);
                    if(route_type[index]===1)
                    {
                        checkroute = true;
                    }else if(route_type[index]===0){
                        checkroute = false;
                    }
                    pick_r = pick_route[index];
                    Load();
                    return false;
                }
                else if(e.keyCode===13){
                    $("ol>li:visible(:contains("+ $("#t").val() +"))").first().addClass('ui-selected');
                }
            });
        }
    });
}

function addTable(){
    var field,row;
    var name=[],route_type=[],date=[],points_array;
    $('#tablesearch').find('tr').remove();
    $.ajax({
        type : "POST",
        url: "../php/load.php",
        success: function(d){
            row = d.split("|");
            points_array = new Array(row.length-1);
            for(var i=0;i<row.length-1;i++){
                field = row[i].split(":");
                name.push(field[0]);
//                alert(field[1]);
                route_type.push(field[1]);
                date.push(field[2]);
                points_array[i] = new Array(field.length-3);
                for(var k=3;k<field.length;k++){
                    points_array[i][k-3] = field[k];
                }
            }
            for(var i=0;i<name.length;i++){
                var tr = document.createElement("tr");
                var td_delete = document.createElement("td");
                var td_name = document.createElement("td");
                var td_route = document.createElement("td");
                var td_date = document.createElement("td");
                var td_start = document.createElement("td");
                var td_end = document.createElement("td");
                var button = document.createElement("button");
                button.innerHTML = "X";
                $(td_delete).append(button);
                td_delete.setAttribute("style","width:39px; text-align: center;");
                td_delete.setAttribute("class","Text4");
                //td_delete.setAttribute("onclick","deleteMap('"+name[i]+"')");
                $(td_name).append(name[i]);
                 $(document).ready(function() {
                     $(td_name).editable('../php/editname.php',{
                         cssclass : 'Text4',
                         indicator : 'Saving...',
                         tooltip   : name[i],
                         type : 'text',
                         width : "120px",
                         heigth : "50px",
                         onblur : 'submit',
                         id : 'editname',
                         name : 'newvalue',
                         "submitdata": function (value, settings) {
                            return {
                                 "origValue": this.revert
                            };
                        }
                     });
                 });
                td_name.setAttribute("style","min-width:215px;max-width:215px; text-align: center;");
                td_name.setAttribute("class","Text5");
                if(route_type[i]==="0")
                {
                    route = "A-Z"
                }else{
                    route = "Fast"
                }
//                else{
//                    alert(route_type[i]);
//                }
                 $(td_route).append(route);
                td_route.setAttribute("style","width:140px; text-align: center;");
                td_route.setAttribute("class","Text4");
                $(td_date).append(date[i]);
                td_date.setAttribute("style","width:140px; text-align: center;");
                td_date.setAttribute("class","Text4");
                $(td_start).append(points_array[i][0]);
                td_start.setAttribute("style","width:390px; text-align: center;");
                td_start.setAttribute("class","Text4");
                $(td_end).append(points_array[i][1]);
                td_end.setAttribute("style","width:385px; text-align: center;");
                td_end.setAttribute("class","Text4");
                button.setAttribute("class","buttonx");
                $(tr).addClass("line");
                $(tr).append(td_delete);
                $(tr).append(td_name);
                $(tr).append(td_route);
                $(tr).append(td_date);
                $(tr).append(td_start);
                $(tr).append(td_end);
                $("#tablesearch").append(tr);
                var table_row = $(tr);
                var b = $(table_row).find("td:first button");
                $(b).click(function(){
                    $.ajax({
                        type: "POST",
                        async: false,
                        url : "../php/delete.php",
                        data : {name : $(this).parent().parent().find("td").eq(1).text()},
                        success : function(return_name){
                            alert("delete "+return_name+" from database successfully.");
                        }
                    });
                      $(this).parent().parent().remove();
                });
            }
        }
    });
    $('#searchdb').keyup(function(){
        var row = $('#tablesearch tr');
        for (var i=0;i<$(row).length;i++){
            $(row[i]).find(':not(:contains('+$("#searchdb").val()+')):gt(1)').parent().hide();
            $(row[i]).find(':contains('+$("#searchdb").val()+')').parent().show();
        }
    });
}

function resetFileName(){
    $('#filename').text(filename);
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