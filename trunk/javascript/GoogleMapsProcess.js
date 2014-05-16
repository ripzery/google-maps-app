var map,map2; // เอาไว้ initilize map-canvas จาก google
var count="0"; // เอาไว้นับ marker เพิ่มค่าเมื่อคลิกวาง marker บน map
var directionsDisplay; // เอาไว้setDirection ที่คำนวนได้จาก directionsService
var directionsService = new google.maps.DirectionsService(); //เอาไว้เรียก method route เพื่อหาเส้นทาง
var points = new Array(); // เอาไว้เก็บตำแหน่งของพิกัดในของ marker
var waypointMarkers = []; // เอาไว้เก็บobject Marker 
var isOptimize = false; // เอาไว้เช็คว่าการคำนวณเส้นทางเป็นแบบไหน {true:หาเส้นที่เร็วที่สุด,false:หาตามลำดับ waypoint} 
var fileName="UntitledMap";// เอาไว้รีเซ็ตชื่อไฟล์กลับมาเป็นเหมือนเดิมโดยเรียก method resetFileName
var isCalcRoute = false; // เอาไว้เช็คว่าเรียกฟังก์ชั่น calcroute หรือยัง เอาไว้แยกเวลา เพิ่ม/เลื่อน/ลบ marker แล้ว คำนวณเส้นทางอัตโนมัติ
var findPlace; //เอาไว้หาสถานที่ใกล้เคียงกับจุดที่เราคลิก
var pickRouteIndex = 0; // เอาไว้เก็บว่าเราเลือกเส้นทางไหน ใน alternative route (ที่google แนะนำเพิ่มเติม)
var startPlace,endPlace; // เอาไว้เก็บชื่อของสถานที่เริ่มต้นกับสถานที่ที่ต้องการจะไป
var polylineOptionsActual = {
    strokeColor: '#000000',
    strokeOpacity: 0.5,
    strokeWeight: 5
};
var isLoad = false;
var map_name = new Array();
var route_type=[],pick_route=[],date=[],points_array="";
var polylines_array = [],mapMarkers=[],activeIndexes = [],keep_path = [];
/*
 * initialize() :  
 * เอาไว้เซ็ตค่าเริ่มต้นให้ตัวแปรต่างๆก่อนนำไปใช้งานได้แก่
 * DirectionService, map, directionsDisplay, findPlace
 * และกำหนด eventlistener เมื่อ click บน map, check/uncheck checkbox, ค้นหา searchbox
 */

function initialize() {
    directionsDisplay = new google.maps.DirectionsRenderer({polylineOptions: polylineOptionsActual,suppressMarkers:true});
    var BTSAri = new google.maps.LatLng(13.779898, 100.544686);
    var mapOptions = {
        zoom: 12,
        center: BTSAri
    };
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById('directions-panel'));
    markers = [];
    setUpVarFromDatabase();
    setUpMultipleMapsTab();
    $.ajax({
       type : "POST",
       url : "../php/check.php",
       data : {name : "UntitledMap"},
       success : function(return_value){
           $('#filename').text(return_value);
           fileName = return_value;
       }
    });
    $('#filename').editable({
        showbuttons : false,
        highlight : "#5D9CEC",
        mode : "popup",
        defaultValue : fileName,
        placement : "bottom",
        success : function(response,return_name){
            fileName = return_name;
        }
    });
    var input = document.getElementById('address');
    var searchBox = new google.maps.places.SearchBox(input); //เอาไว้search แบบauto complete
    $('#chk').iCheck({
        checkboxClass: 'icheckbox_minimal-blue',
        increaseArea: '20%' // optional
    });
    $('#chk').on('ifChecked', function(event){
        for(var i=0;i<waypointMarkers.length;i++){
            waypointMarkers[i].setVisible(false);
        }
    });
    $('#chk').on('ifUnchecked', function(event){
        for(var i=0;i<waypointMarkers.length;i++){
            waypointMarkers[i].setVisible(true);
        }
    });
    var hotkey = function (event){
            if(!$('#address').is(':focus') && !$('#t').is(':focus') && !$('#searchdb').is(':focus')){
                if(event.which === 102){// f
                    $('#shRoute').trigger('click');
                }else if(event.which === 97){// a
                    $('#azRoute').trigger('click');
                }else if(event.which === 115){// s
                    $('#save').trigger('click');
                }else if(event.which === 108){// l
                    $('#opener').trigger('click');
                }else if(event.which === 49){// 1
                    $('#suggestRoute>li').eq(0).trigger('click');
                }else if(event.which === 50){// 2
                    $('#suggestRoute>li').eq(1).trigger('click');
                }else if(event.which === 51){// 3
                    $('#suggestRoute>li').eq(2).trigger('click');
                }else if(event.which === 103){// G
                    $('#guide').trigger('click');
                }else if(event.which === 114){// R
                    $('#reset').trigger('click');
                }
            }
        };
    $('body').keypress(hotkey);
    $('a[data-toggle="tab"]').on('show.bs.tab',function(e){
       if($(e.target).text()==="Database"||$(e.target).text()==="Multi-Route Display")
       {
           $('body').unbind('keypress',hotkey); 
       }else{
           $('body').bind('keypress',hotkey); 
       } 
    });
    $('.editable').on('shown',function(){
        $('body').unbind('keypress',hotkey); 
    });
    $('.editable').on('hidden',function(){
        $('body').bind('keypress',hotkey); 
    });
        
    google.maps.event.addListener(searchBox, 'places_changed', function() {// เมื่อ search จะโชวmarker เป็นรูปชนิดของสถานที่ใกล้เคียง
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
    findPlace = new google.maps.places.PlacesService(map);
    google.maps.event.addListener(map, 'click', function(event) {
      if(waypointMarkers.length<10)
      {
        points.push(event.latLng.lat()+","+event.latLng.lng());
        addWaypointToList();
        placeMarker(event.latLng,map);
        if(isCalcRoute && points.length >2){
              calcRoute();
        }
      }
      else{
          alert("Reach maximum 8 waypoints!");
      }
  });
}

/*
 * shRoute,azRoute เอาไว้เรียกเมื่อกดปุ่ม Short Route,A-Z Route ตามลำดับ ซึ่งจะมีวิธีการคำนวณเส้นทางต่างกันคือ
 * Short Route จะคำนวณเส้นทางสั้นที่สุด
 * A-Z จะคำนวณตามลำดับของ waypoints
 */
function setUpMultipleMapsTab(){
    var BTSAri = new google.maps.LatLng(13.779898, 100.544686);
    map2 = new google.maps.Map(document.getElementById('map-canvas-2'), {zoom: 12,center: BTSAri});
    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        google.maps.event.trigger(map2,'resize');
    });
    addEventListener_Btn_MultipleMapsTab();
}

function addEventListener_Btn_MultipleMapsTab(){
    $("#btn-modal-maps").click(function(){
        $('#md-select-route').modal();
        setUpModalMultipleMapsTab();
        addEventListener_Modal_MultipleMapsTab();
    });
    $('#btn-reset-map2').click(function(){
        for(var i=0;i<polylines_array.length;i++){
            polylines_array[i].setMap(null);
        }
        $('#maps_list>a:gt(0)').remove();
        for(var i=0;i<mapMarkers.length;i++){
            mapMarkers[i].setMap(null);
        }
        mapMarkers = [];
        $('#md-list-maps>a').removeClass('active');
        activeIndexes = [];
        polylines_array = [];
    });
    $('#btn-guide-map2').click(function(){
        $('#direction').modal({keyboard:true});
        var id = map_name.indexOf($("#maps_list>.active:gt(0)").text().replace(" Hide",""));
        var wps = [];
        for(var i=2;i<points_array[id].length;i++){
            wps.push({location:points_array[id][i],stopover:true});
        }
        var request = {
          origin:points_array[id][0],
          destination:points_array[id][1],
          waypoints:wps,
          provideRouteAlternatives : true,
          optimizeWaypoints:isOptimize,
          travelMode: google.maps.TravelMode.DRIVING
        };
        if(route_type[id]===1){
            isOptimize = true;
        }else if(route_type[id]===0){
            isOptimize = false;
        }
        var directionsDisplay = new google.maps.DirectionsRenderer();
        directionsDisplay.setPanel(document.getElementById('directions-panel'));
        directionsService.route(request, function(response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
               directionsDisplay.setDirections(response);
               directionsDisplay.setRouteIndex(parseInt(pick_route[id]));
            }
        });
    });
}

function addMapToList(index){
    var list = document.getElementById("maps_list");
    var a = document.createElement("a");
    var label = document.createElement("label");
    var chk = document.createElement("input");
    chk.setAttribute("type","checkbox");
    label.appendChild(chk);
    label.appendChild(document.createTextNode(" Hide"));
    label.setAttribute("class","hide-route");
    a.classList.add("list-group-item");
    a.appendChild(document.createTextNode(map_name[index]));
    a.appendChild(label);
    list.appendChild(a);
    addEventListener_MapList_MultipleMapsTab(list,chk,a);
}

function addEventListener_MapList_MultipleMapsTab(list,chk,a){
    var event_a = function(){
        var bounds = new google.maps.LatLngBounds();
        var id = map_name.indexOf($(this).text().replace(" Hide",""));
        var polyline_id  = $(list).find("a").index($(this))-1;
//        alert("PolyID : "+polyline_id+",PolySize : "+polylines_array.length);
        var lat = points_array[id][0].split(",")[0];
        var lng = points_array[id][0].split(",")[1];
        var position = new google.maps.LatLng(lat,lng);
        
        map2.setCenter(position);
        $(this).addClass('active').siblings(':gt(0)').removeClass('active');
        polylines_array[polyline_id].setVisible(true);
        $(chk).iCheck('uncheck');
        for(var i=0;i<polylines_array.length;i++){
            if(i!==polyline_id)
            {
                polylines_array[i].setOptions({strokeColor: "black",strokeOpacity:0.6});
            }else{
                polylines_array[i].setOptions({strokeColor: "blue",strokeOpacity:0.6,strokeWeight:5});
            }
        }
        for(var i =0;i<mapMarkers.length;i++){
            mapMarkers[i].setMap(null);
        }
        mapMarkers = [];
        var image = "../marker-icon-number/start.png";
        while(mapMarkers.length<points_array[id].length){
            position = new google.maps.LatLng(points_array[id][mapMarkers.length].split(",")[0],points_array[id][mapMarkers.length].split(",")[1]);
            bounds.extend(position);
            var marker = new google.maps.Marker({
                position : position,
                map : map2,
                icon : image,
                animation : google.maps.Animation.DROP
            });
            mapMarkers.push(marker);
            if(mapMarkers.length===1){
                image = "../marker-icon-number/end.png";
            }
            else{
                image = "../marker-icon-number/number_"+(parseInt(mapMarkers.length)-1)+".png";
            }
        }
        map2.fitBounds(bounds);
    };
    $(chk).iCheck({
        checkboxClass: 'icheckbox_minimal-blue',
        increaseArea: '10%' // optional
    });
    $(chk).on('ifChecked', function(){
        var id  = $(list).find("a").index($(chk).parent().parent().parent())-1;
        polylines_array[id].setVisible(false);
        if($(this).parent().parent().parent().hasClass('active'))
        {
            for(var i=0;i<mapMarkers.length;i++){
                mapMarkers[i].setVisible(false);
            }
        }
    });
    $(chk).on('ifUnchecked', function(){
        var id  = $(list).find("a").index($(chk).parent().parent().parent())-1;
        polylines_array[id].setVisible(true);
        if($(this).parent().parent().parent().hasClass('active'))
        {
            for(var i=0;i<mapMarkers.length;i++){
                mapMarkers[i].setVisible(true);
            }
        }
    });
//    $(btn).click(function(){
//        var a_remove_target = $(this).parent().parent();
//        var maps_list = $("#maps_list");
//        var index = $("#maps_list").find("a:gt(0)").index(a_remove_target);
//        alert(index);
//        $(maps_list).remove(a_remove_target);
//        polylines_array.splice(index,1);
//    });
    
    a.addEventListener('click',event_a);
}

function setUpModalMultipleMapsTab(){
    $('#md-list-maps').find('a').remove();
    for(var i=0;i<map_name.length;i++){
        if(activeIndexes.indexOf(i)==-1){
            var li = document.createElement("a");
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
            $(li).append(map_name[i]);
            li.setAttribute("class","list-group-item");
            li.setAttribute("style","text-align: left;word-spacing: 20px;");
            $("#md-list-maps").append(li);
        }else{
            
        }
    }
}

function addEventListener_Modal_MultipleMapsTab(){
    var event_list_maps = function(){
        var count;
        var badge_count = $('#badge-count');
        if($(this).hasClass("active"))
        {
            $(this).removeClass("active");
            count = parseInt($(badge_count).text())-1;
            $(badge_count).text(count);
        }else{
            $(this).addClass("active");
            count = parseInt($(badge_count).text())+1;
            $(badge_count).text(count);
        }
    };
    var event_btn_load = function(){
        $('#badge-count').text("0");
        for(var i=0;i<mapMarkers.length;i++){
            mapMarkers[i].setMap(null);
        }
        var multipleRoute = $('#md-list-maps>.active');
        var strings_array = [];
        console.log("Begin load .....");
        for(var i =0;i<multipleRoute.length;i++){
//            var index = $(multipleRoute[i]).index();
            var string_map_name = "";
            var split_size = $(multipleRoute[i]).text().split(" ").length;
            if(split_size>3){
                var extend = $(multipleRoute[i]).text().split(" ");
                string_map_name = extend[2];
                for(var k=3;k<split_size;k++){
                    string_map_name = string_map_name + " " + extend[k];
                }
            }else{
                string_map_name = $(multipleRoute[i]).text().split(" ")[2];
            }
            strings_array.push(string_map_name);
            var index = map_name.indexOf(string_map_name);
            activeIndexes.push(index);
            addMapToList(index);
        }
        $.ajax({
            type : "POST",
            data : ({name : strings_array}),
            url : "../php/fetchPath.php",
            success : function(d){
                var paths_array = d.split(":");
                for(var i =0;i<paths_array.length-1;i++){
                    var path = [];
                    var string_path = paths_array[i].split("|");
                    console.log("round "+i+" : "+string_path.length+ " pts");
                    var latlng = "";
                    for(var j=0;j<string_path.length;j++){
                        latlng = string_path[j].split(",");
                        path.push(new google.maps.LatLng(latlng[0],latlng[1]));
                    }
                    var polyline = new google.maps.Polyline({path:path,strokeOpacity:0.6});
                    polyline.setMap(map2);
                    polylines_array.push(polyline);
                }
                console.log("Finished load .....");
            }
        });
        
    };
    var event_btn_all_load = function(){
        var list_maps = $('#md-list-maps').find("a");
        $(list_maps).addClass("active");
        $('#badge-count').text($(list_maps).length);
    };
    var event_btn_close = function(){
        $('#badge-count').text("0");
    }
    $('#md-list-maps').find("a").unbind("click").click(event_list_maps);
    $('#md-btn-load').unbind("click").click(event_btn_load);
    $('#md-btn-select-all').unbind("click").click(event_btn_all_load);
    $('#md-btn-close').unbind("click").click(event_btn_close);
}

function setUpVarFromDatabase(){
    map_name = [],route_type = [],pick_route = [],date = [],points_array = [];
    $.ajax({
        type :"POST",
        url: "../php/load.php",
        success: function(d){
            var field,row;
            row = d.split("|");
            points_array = new Array(row.length-1);
            for(var i=0;i<row.length-1;i++){
                field = row[i].split(":");
                map_name.push(field[0]);
                route_type[i] = field[1];
                pick_route[i] = field[2];
                date[i] = field[3];
                points_array[i] = new Array(field.length-4);
                for(var k=4;k<field.length;k++){
                    points_array[i][k-4] = field[k];
                }
            }
            console.log("setUpVar complete");
            addTable();
        }
    });
}

function shRoute(){
  isOptimize = true; 
  calcRoute();
}

function azRoute(){
  isOptimize = false;
  calcRoute();
}

function pushPath(){
    var wps = [],path="";
    var temp="";
    for(var j=2;j<points.length;j++){
        wps.push({location:points[j],stopover:true});
    }
    var request = {
        origin:points[0],
        destination:points[1],
        waypoints:wps,
        optimizeWaypoints:isOptimize,
        travelMode: google.maps.TravelMode.DRIVING
    };
    directionsService.route(request, function(response, status){
        if(status == google.maps.DirectionsStatus.OK){
            var arr = new Array();
            for(var j=0;j<response.routes[0].legs.length;j++){
              for(var i=0;i<response.routes[0].legs[j].steps.length;i++){
                  for(var k=0;k<response.routes[0].legs[j].steps[i].path.length;k++){
                        temp = response.routes[0].legs[j].steps[i].path[k].toString().replace(" ","");
                        temp = temp.replace("(","");
                        temp = temp.replace(")","");
                        path = path + temp + "|";
                  }
              }
            }
            path = path.substring (0,path.length-1);
//            console.log("path in pushPath : "+path);
            Save(path);
        }
        else{
            alert(status);
        }
    });
}

/*
 * calcRoute()
 * เอาไว้ส่ง start,end,waypoint ทั้งหมดให้ google render เส้นทางออกมาให้
 * ผ่าน method DirectionsService.route และให้ directionsDisplay.setDirection(ผลลัพธ์ที่ได้จาก callback function)
 */
function calcRoute() {
  isCalcRoute = true;
//  directionsService = new google.maps.DirectionsService();
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
      optimizeWaypoints:isOptimize,
      travelMode: google.maps.TravelMode.DRIVING
    };
  
  directionsService.route(request, function(response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      $('#suggestRoute>li').remove();
      if(response.routes.length>1)
        {
            for(var i =0;i<response.routes.length;i++)
            {
                var li = document.createElement("li");
                var a = document.createElement("a");
                $(a).attr('href="#"');
                $(a).append(response.routes[i].summary+" "+response.routes[i].legs[0].distance.text +" " +response.routes[i].legs[0].duration.text);
                $(li).append(a);
                $('#suggestRoute').append(li);
            }
            directionsDisplay.setDirections(response);
            directionsDisplay.setRouteIndex(parseInt(pickRouteIndex));
            $('#suggestRoute>li').click(function()
            {
                directionsDisplay.setDirections(response);
                if($('#suggestRoute>li').index(this)==0){
                    directionsDisplay.setRouteIndex(0);
                    pickRouteIndex = 0;
                }else if($('#suggestRoute>li').index(this)==1){
                    directionsDisplay.setRouteIndex(1);
                    pickRouteIndex = 1;
                }else{
                    directionsDisplay.setRouteIndex(2);
                    pickRouteIndex = 2;
                }
            });
        }
      else{
          directionsDisplay.setDirections(response);
      }
    }
  });
}

/*
 * placeMarker()
 * ทำงานเมื่อคลิกบนmap,โหลดข้อมูลจาก database เอาไว้วาง markerบนพิกัดที่ต้องการพร้อมกับ
 * เซ็ต eventlistener เมื่อ drag,right-click บนmarker (drag=edit position,right-click=remove marker)
 * 
 */
function placeMarker(position,map){
    var image;
    var start = $("#list>a:nth-child(2)");
    var end = $("#list").find("a:last");
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
    marker.setZIndex(parseInt(count));
    marker.set("animation",google.maps.Animation.DROP);
    waypointMarkers[marker.id] = marker;
    count++;
    var request = {
        location : position,
        types : ['establishment','gas_station','car_dealer','car_rental','car_repair','car_wash','department_store','shopping_mall','storage','parking'],
        rankBy : google.maps.places.RankBy.DISTANCE
    };
    if(count==1&&!isLoad){
        findPlace.nearbySearch(request,function(results,status){
            if (status == google.maps.places.PlacesServiceStatus.OK){
                startPlace = results[0].name +" "+ results[0].vicinity;
                $(start).text("Start : "+startPlace);
            }
        });
    }
    else if(count==2&&!isLoad){
        findPlace.nearbySearch(request,function(results,status){
            if (status == google.maps.places.PlacesServiceStatus.OK){
                endPlace = results[0].name +" "+results[0].vicinity;
                $(end).text("End : "+endPlace);
            }
        });
    }
    var index;
//      เก็บพิกัดก่อนที่จะdrag marker เสร็จ เพื่อเอาพิกัดไปหาตำแหน่งที่เก็บใน array points ให้เจอก่อน
//      ค่อยเปลี่ยนพิกัดนั้นเป็นพิกัดใหม่หลังจาก drag เสร็จ
    google.maps.event.addListener(marker,'mousedown',function(event) {
        index = points.indexOf(event.latLng.lat()+","+event.latLng.lng());
        if(isCalcRoute){
            calcRoute();
        }
    });
//      หลังจาก drag marker เสร็จจะอัพเดตพิกัดของ waypoint ใน listbox 
//      พร้อมอัพเดตค่าที่เก็บไว้ใน array points ด้วย
    google.maps.event.addListener(marker,'dragend',function(event) {
        request.location = event.latLng;
        points[index] = event.latLng.lat()+","+event.latLng.lng();
        var list = $("#list").find("a");
        if(index===0){
            findPlace.nearbySearch(request,function(results,status){
                if (status == google.maps.places.PlacesServiceStatus.OK) {
                    $("#list>a").eq(1).text("Start : " + results[0].name +" "+ results[0].vicinity);
                }
            });
            list.eq(index+1).text("Start : "+startPlace);
        }
        else if(index===1){
            findPlace.nearbySearch(request,function(results,status){
                if (status == google.maps.places.PlacesServiceStatus.OK) {
                    $("#list>a:last").text("End : " + results[0].name +" "+ results[0].vicinity);
                }
            });
            list.eq(points.length).text("End : "+endPlace);
        }
        else{
            console.log(index-1);
            list.eq(index).text("Waypoint "+(index-1)+": "+points[index]);
        }
        if(isCalcRoute){
            calcRoute();
        }
    });
//      ใส่ listener เมื่อคลิกขวาที่ตัว marker จะทำการลบ waypoint ของ markerนั้น ในlistbox
//      พร้อมลบค่าพิกัดที่เก็บใน point และเอาตัว marker ออกจากarray waypointMarkers
//      พร้อมลบ marker นั้นออกจากแมพ สุดท้ายลดค่าตัวแปร count ที่เอาไว้นับ waypoint ลงหนึ่ง
    google.maps.event.addListener(marker,"rightclick",function(event){
        var index = points.indexOf(event.latLng.lat()+","+event.latLng.lng());
        var waypoint = $("#list").find("a");
        //เปลี่ยนลำดับ waypoint ใน tag li ที่ index>index+1 จนถึง < length
        if(index===0 || index===1){
            clearMap();
        }
        else{
            for(var i=index+1,li;li = waypoint.eq(i),i<waypoint.length-1;i++){
                $(li).text($(li).text().replace("Waypoint "+(i-1).toString(),"Waypoint "+(i-2).toString()));
                image = "../marker-icon-number/number_"+(i-2)+".png";
                waypointMarkers[i].set("id",i-1);
                waypointMarkers[i].setIcon(image);
            }
            waypoint.eq(index).remove();
            points.splice(index,1);
            waypointMarkers[index].setMap(null);
            waypointMarkers.splice(index,1);
            count--;
        }
        if(isCalcRoute){
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
    $('#suggestRoute').children().remove();
    points = [];
    isCalcRoute = false;
    count = 0;
    $('#address').val('');
    for(var i=0;i<waypointMarkers.length;i++){
        waypointMarkers[i].setMap(null);
    }
    waypointMarkers  = [];
    var list = $("#list").find("a");
    for(var i=list.length-1,li;li=list.eq(i),i>0;i--){
        li.remove();
    }
    directionsDisplay = new google.maps.DirectionsRenderer({polylineOptions: polylineOptionsActual,suppressMarkers:true});
    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById('directions-panel'));
}

//เมื่อสร้าง marker หลังจากคลิ๊กบนแผนที่แล้วก็จะบันทึกพิกัดของ waypoint ลงใน textbox
function addWaypointToList(){
    var ul = document.getElementById("list");
    var li = document.createElement("a");
    var position = points[points.length-1];
    li.classList.add("list-group-item");
    li.addEventListener('click',function(){
        var nodes = $("#list").find("a");
        if(this===nodes[1])
        {
            map.setCenter(waypointMarkers[0].getPosition());
        }else if(this===nodes[nodes.length-1]){
            map.setCenter(waypointMarkers[1].getPosition());
        }else{
            map.setCenter(waypointMarkers[$(nodes).index(this)].getPosition());
        }
    });
    if($("#list>a").length<2){
        li.appendChild(document.createTextNode("Start : "+position));
        ul.appendChild(li);
    }
    else if($("#list>a").length===2){
        li.appendChild(document.createTextNode("End : "+position));
        ul.appendChild(li);
    }
    else{
        li.appendChild(document.createTextNode("Waypoint "+(points.indexOf(position)-1)+": "+position));
        ul.insertBefore(li,ul.childNodes[ul.childNodes.length-1]);
    }
}

/*
 * Save()
 * นำค่า filename,route_type,pickRouteIndex,points เก็บลง database ผ่าน ajax called
 * พร้อมกับ refresh ค่าในตาราง tab2
 */
function Save(path){
    var confirm_save = confirm("Do you want to save this map?");
    if(confirm_save===true)
    {
        var route_type;
        pickRouteIndex = directionsDisplay.getRouteIndex();
        if(isOptimize){
            route_type = 1;
        }
        else{
            route_type = 0;
        }
        if(points.length<2){
            alert("Please insert start-end point.");
            return false;
        }
        fileName = $('#filename').text();
        $.ajax({
            type: "POST",
            url : "../php/save.php",
            data: ({name : fileName,route_type : route_type,pick_route : pickRouteIndex,latlng: points,path:path}),
            success: function(){
                setUpVarFromDatabase();
                alert("Save file to database successfully.");
            },
            error: function(xhr, status, error) {
                alert(xhr.responseText);
                alert("Save file to database unsuccessfully.");
           }
        });
    }
    else{
        alert("Cancle save process.");
    }
}

/*
 * InitLoad() -> Load() (InitLoad จะต้องเรียกก่อน Load เสมอ)
 * เรียก modal dialog ที่สามารถ search ข้อมูลไฟล์ที่ต้องการจะโหลดได้ เมื่อคลิก/ใส่ข้อความใน searchbox เพื่อเลือก 
 * ก้จะโหลด filename,route_type,date,start,end มาเก็บไว้ในตัวแปรเพื่อเตรียมนำมาแสดงผลบนหน้าจอ
 */
function Load(){
    var lat,lng;
    var points_temp = [];
    isLoad = true;
//    directionsDisplay.setPanel(null);
    for(var i=0;i<points.length;i++){
        //console.log(points[i]);
        points_temp.push(points[i]);
    }
    clearMap();
    for(var i=0;i<points_temp.length;i++){
        points.push(points_temp[i]);
        lat = points[i].split(",")[0];
        lng = points[i].split(",")[1];
        placeMarker(new google.maps.LatLng(lat,lng),map);
        addWaypointToList();
    }
    calcRoute();
    var request = {
        location : new google.maps.LatLng(points[0].split(",")[0],points[0].split(",")[1]),
        types : ['establishment','gas_station','car_dealer','car_rental','car_repair','car_wash','department_store','shopping_mall','storage','parking'],
        rankBy : google.maps.places.RankBy.DISTANCE
    };
    findPlace.nearbySearch(request,function(results,status){
        if (status == google.maps.places.PlacesServiceStatus.OK){
            startPlace = results[0].name +" "+ results[0].vicinity;
            $("#list>a:nth-child(2)").text("Start : "+startPlace);
        }
    });
    request.location = new google.maps.LatLng(points[points.length-1].split(",")[0],points[points.length-1].split(",")[1]);
    findPlace.nearbySearch(request,function(results,status){
        if (status == google.maps.places.PlacesServiceStatus.OK){
            endPlace = results[0].name +" "+ results[0].vicinity;
            $("#list>a:last").text("End : "+endPlace);
        }
    });
}

function initLoad(){
    var sort_list = $('.dropdown-menu').parent();
    var t = $('#t');
    var filename = $('#filename');
    $('#selectable').find("a").remove();
    for(var i=0;i<map_name.length;i++){
        var li = document.createElement("a");
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
        $(li).append(map_name[i]);
        li.setAttribute("class","list-group-item");
        li.setAttribute("style","text-align: left;word-spacing: 20px;");
        $("#selectable").append(li);
    }
    $(sort_list).on('show.bs.dropdown',function(e){
        $('#Asc').on('click',function(){
            $("#selectable").find('a').remove();
            $('#order').text("Ascending");
            for(var i=0;i<map_name.length;i++){
                var li = document.createElement("a");
                $(li).attr("href='#'");
                $(li).addClass("list-group-item");
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
                $(li).append(map_name[i]);
                li.setAttribute("class","list-group-item");
                li.setAttribute("style","text-align: left;word-spacing: 20px;");
                $(li).click(function(){
                   $(this).addClass("active");
                   $(this).siblings().removeClass("active");
                });
                $("#selectable").append(li);
            }
        });
        $('#Dsc').on('click',function(){
            $("#selectable").find('a').remove();
            $('#order').text("Descending");
            for(var i=map_name.length-1;i>=0;i--){
                var li = document.createElement("a");
                $(li).attr("href='#'");
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
                $(li).append(map_name[i]);
                li.setAttribute("class","list-group-item");
                li.setAttribute("style","text-align: left;word-spacing: 20px;");
                $(li).click(function(){
                   $(this).addClass("active");
                   $(this).siblings().removeClass("active");
                });
                $("#selectable").append(li);
            }
        });
    });
    var allMapsData = $("#selectable");
    $(t).keyup(function(){
        var len = allMapsData.length;
        var string = $(t).val();
        allMapsData.find('a:not(:contains(' + string + '))').hide();
        allMapsData.find("a:contains("+ string +")").show();
    });
    $(allMapsData).find("a").click(function(){
        $(this).addClass("active").siblings().removeClass("active");
    });
    $(allMapsData).find("a").click(function(){
        $(this).addClass("active").siblings().removeClass("active");
        var index = $(this).index();
        var number_of_points = points_array[index].length;
        points = [];
        for(var i=0;i<number_of_points;i++){
            points[i] = points_array[index][i];
        }
        $(filename).text(map_name[index]);
        if(route_type[index]===1)
        {
            isOptimize = true;
        }else if(route_type[index]===0){
            isOptimize = false;
        }
        pickRouteIndex = pick_route[index];

    });
    $(t).keydown(function(e){
        if(e.keyCode===13&&$(allMapsData).find('a').hasClass('active')){
            var index = $(allMapsData).find('a.active').index();
            var number_of_points = points_array[index].length;
            points = [];
            for(var i=0;i<number_of_points;i++){
                points[i] = points_array[index][i];
            }
            $(allMapsData).find('a').removeClass('active');
            $(filename).text(map_name[index]);
            if(route_type[index]===1)
            {
                isOptimize = true;
            }else if(route_type[index]===0){
                isOptimize = false;
            }
            pickRouteIndex = pick_route[index];
            $( "#doLoad" ).trigger('click');
            return false;
        }
        else if(e.keyCode===13){
            $(allMapsData).find("a:visible(:contains("+ $("#t").val() +"))").first().addClass('active').siblings().removeClass('active');
        }
    });
}

/*
 * addTable()
 * เป็นการโหลดค่าจาก database มาลงตารางใน tabs2
 */
function addTable(){
    $('#tablebody').find('tr').remove();
    for(var i=0;i<map_name.length;i++){
        var tr = document.createElement("tr");
        var td_delete = document.createElement("td");
        var td_name = document.createElement("td");
        var td_route = document.createElement("td");
        var td_date = document.createElement("td");
        var td_start = document.createElement("td");
        var td_end = document.createElement("td");
        var button_x = document.createElement("button");
        var button_view = document.createElement("button");
        var td_view = document.createElement("td");
        button_view.innerHTML = "View";
        $(button_view).addClass("btn btn-primary btn-block");
        button_view.setAttribute("style","width:45px;");
        $(td_view).append(button_view);
        button_x.innerHTML = "X";
        $(button_x).addClass("btn btn-danger btn-block");
        button_x.setAttribute("style","width:30px;");
        button_x.setAttribute("id","delete");
        $(td_delete).append(button_x);
        td_name.setAttribute("style","width:150px;");
        $(td_name).append(map_name[i]);
        $(td_name).editable({
            type : "text",
            showbuttons : true,
            mode : "popup",
            pk : {name : ""},
            params : function(params){
                params.origValue = $(this).text();
                return params;
            },
            url : "../php/editname.php",
            success : function(){
                alert("Edit name and save successfully.");
                setUpVarFromDatabase();
            }
        });
        if(route_type[i]==="0")
        {
            route = "A-Z";
        }else{
            route = "Fast";
        }
        $(td_route).append(route);
        td_route.setAttribute("style","width:150px;");
        $(td_date).append(date[i]);
        $(td_start).append(points_array[i][0]);
        $(td_end).append(points_array[i][1]);
        $(tr).append(td_view);
        $(tr).append(td_delete);
        $(tr).append(td_name);
        $(tr).append(td_route);
        $(tr).append(td_date);
        $(tr).append(td_start);
        $(tr).append(td_end);
        $("#tablebody").append(tr);
        $(button_x).click(function(){
            var confirm_delete = confirm("Do you want to delete this map?");
            if(confirm_delete===true)
            {
                $.ajax({
                    type: "POST",
                    async: false,
                    url : "../php/delete.php",
                    data : {name : $(this).parent().parent().find("td").eq(2).text()},
                    success : function(return_name){
                        alert("delete "+return_name+" from database successfully.");
                        setUpVarFromDatabase();
                    },
                    error : function(){
                        alert("delete map unsucessfully.")
                    }
                });
                  $(this).parent().parent().remove();
            }
            else{
                alert("Cancle delete process.");
            }
        });
        $(button_view).click(function(){
            var index = map_name.indexOf($(this).parent().parent().find("td").eq(2).text());
            var lat,lng;
            isLoad = true;
            clearMap();
            for(var x=0;x<points_array[index].length;x++){
                points[x] = points_array[index][x];
                lat = points_array[index][x].split(",")[0];
                lng = points_array[index][x].split(",")[1];
                placeMarker(new google.maps.LatLng(lat,lng),map);
                addWaypointToList();
            }
            if(route_type[index]===1)
            {
                isOptimize = true;
            }
            else
            {
                isOptimize = false;
            }
            pickRouteIndex = pick_route[index];
            $('#filename').text(map_name[index]);
            $('#myTab1 a:first').tab('show');
            var request = {
                location : new google.maps.LatLng(points[0].split(",")[0],points[0].split(",")[1]),
                types : ['establishment','gas_station','car_dealer','car_rental','car_repair','car_wash','department_store','shopping_mall','storage','parking'],
                rankBy : google.maps.places.RankBy.DISTANCE
            };
            findPlace.nearbySearch(request,function(results,status){
                if (status == google.maps.places.PlacesServiceStatus.OK){
                    startPlace = results[0].name +" "+ results[0].vicinity;
                    $("#list>a:nth-child(2)").text("Start : "+startPlace);
                }
            });
            request.location = new google.maps.LatLng(points[points.length-1].split(",")[0],points[points.length-1].split(",")[1]);
            findPlace.nearbySearch(request,function(results,status){
                if (status == google.maps.places.PlacesServiceStatus.OK){
                    endPlace = results[0].name +" "+ results[0].vicinity;
                    $("#list>a:last").text("End : "+endPlace);
                }
            });
            setTimeout(function(){
                calcRoute();
            },200); 
        });
        
    }
//    map.setZoom(15);
//    map.setCenter(new google.maps.LatLng(points[0].split(",")[0],points[0].split(",")[1]));
    $('#searchdb').keyup(function(){
        var row = $('#tablebody tr');
        for (var i=0;i<$(row).length;i++){
            $(row[i]).find(':not(:contains('+$("#searchdb").val()+')):gt(1)').parent().hide();
            $(row[i]).find(':contains('+$("#searchdb").val()+')').parent().show();
        }
    });
}

/*
 * resetFileName()
 * เป็นการ reset ชื่อไฟล์กลับไปเป็นค่าเดิม
 * 
 */
function resetFileName(){
    $('#filename').text(fileName);
}
// This default onbeforeunload event
//window.onbeforeunload = function(){
//    return "Are you sure to leave?"
//}
//
//// A jQuery event (I think), which is triggered after "onbeforeunload"
//$(window).unload(function(){
//
//});
google.maps.event.addDomListener(window, 'load', initialize);