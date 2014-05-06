var map; // เอาไว้ initilize map-canvas จาก google
var count="0"; // เอาไว้นับ marker เพิ่มค่าเมื่อคลิกวาง marker บน map
var directionsDisplay; // เอาไว้setDirection ที่คำนวนได้จาก directionsService
var directionsService = new google.maps.DirectionsService(); //เอาไว้เรียก method route เพื่อหาเส้นทาง
var points = new Array(); // เอาไว้เก็บตำแหน่งของพิกัดในของ marker
var waypointMarkers = []; // เอาไว้เก็บobject Marker 
var isOptimize = false; // เอาไว้เช็คว่าการคำนวณเส้นทางเป็นแบบไหน {true:หาเส้นที่เร็วที่สุด,false:หาตามลำดับ waypoint} 
var fileName="UntitledMap";// เอาไว้รีเซ็ตชื่อไฟล์กับมาเป็นเหมือนเดิมโดยเรียก method resetFileName
var isCalcRoute = false; // เอาไว้เช็คว่าเรียกฟังก์ชั่น calcroute หรือยัง เอาไว้แยกเวลา เพิ่ม/เลื่อน/ลบ marker แล้ว คำนวณเส้นทางอัตโนมัติ
var findPlace; //เอาไว้หาสถานที่ใกล้เคียงกับจุดที่เราคลิก
var pickRouteIndex = 0; // เอาไว้เก็บว่าเราเลือกเส้นทางไหน ใน alternative route (ที่google แนะนำเพิ่มเติม)
var startPlace,endPlace; // เอาไว้เก็บชื่อของสถานที่เริ่มต้นกับสถานที่ที่ต้องการจะไป

/*
 * initialize() :  
 * เอาไว้เซ็ตค่าเริ่มต้นให้ตัวแปรต่างๆก่อนนำไปใช้งานได้แก่
 * DirectionService, map, directionsDisplay, findPlace
 * และกำหนด eventlistener เมื่อ click บน map, check/uncheck checkbox, ค้นหา searchbox
 */

function initialize() {
    directionsDisplay = new google.maps.DirectionsRenderer({});
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
           fileName = return_value;
       }
    });
    $(document).ready(function() {
        $('#filename').editable({
            showbuttons : false,
            highlight : "#5D9CEC",
            mode : "popup",
            placement : "bottom",
            success : function(response,return_name){
                fileName = return_name;
            }
        });
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
      if(waypointMarkers.length<10){
        console.log(waypointMarkers.length);
        points.push(event.latLng.lat()+","+event.latLng.lng());
        addWaypointToList();
        placeMarker(event.latLng,map);
        if(isCalcRoute && points.length >2){
              calcRoute();
        }
      }else{
          alert("Reach maximum 8 waypoints!");
      }
  });
}

/*
 * shRoute,azRoute เอาไว้เรียกเมื่อกดปุ่ม Short Route,A-Z Route ตามลำดับ ซึ่งจะมีวิธีการคำนวณเส้นทางต่างกันคือ
 * Short Route จะคำนวณเส้นทางสั้นที่สุด
 * A-Z จะคำนวณตามลำดับของ waypoints
 */
function shRoute(){
  isOptimize = true; 
  calcRoute();
}

function azRoute(){
  isOptimize = false;
  calcRoute();
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
      directionsDisplay.setDirections(response);
      directionsDisplay.setRouteIndex(parseInt(pickRouteIndex));
//      var order = "Start > ";
//      for(var i=0;i<response.routes[0].waypoint_order.length;i++){
//          order = order + "Waypoint "+(response.routes[0].waypoint_order[i]+1)+" > ";
//      }
//      order = order + "End";
      //alert(response.routes[0].waypoint_order);
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
    //alert($("#list>li:nth-child(2)").text().indexOf(","));
    if(count==1){
        findPlace.nearbySearch(request,function(results,status){
            if (status == google.maps.places.PlacesServiceStatus.OK){
                startPlace = results[0].name +" "+ results[0].vicinity;
                $("#list>a:nth-child(2)").text("Start : "+startPlace);
            }
        });
    }
    else if(count==2){
        findPlace.nearbySearch(request,function(results,status){
            if (status == google.maps.places.PlacesServiceStatus.OK){
                endPlace = results[0].name +" "+results[0].vicinity;
                $("#list>a:last").text("End : "+endPlace);
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
//        alert(waypoint.length);
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
//            alert(waypoint.eq(3).text());
            waypoint.eq(index).remove();
            points.splice(index,1);
            waypointMarkers[index].setMap(null);
            waypointMarkers.splice(index,1);
            count--;
        }
        if(isCalcRoute){
//            alert("CalcRoute again!");
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
    directionsDisplay = new google.maps.DirectionsRenderer();
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
        var pos = this.innerHTML.split(" ");
        var nodes = $("#list").find("a");
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
function Save(){
    var route_type;
    pickRouteIndex = directionsDisplay.getRouteIndex();
//    alert(pickRouteIndex);
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
        data: ({name : fileName,route_type : route_type,pick_route : pickRouteIndex,latlng: points}),
        success: function(){
            alert("Send file to save.php successful.");
        },
        error: function(xhr, status, error) {
            alert(xhr.responseText);
       }
    });
    addTable();
}

/*
 * InitLoad() -> Load() (InitLoad จะต้องเรียกก่อน Load เสมอ)
 * เรียก modal dialog ที่สามารถ search ข้อมูลไฟล์ที่ต้องการจะโหลดได้ เมื่อคลิก/ใส่ข้อความใน searchbox เพื่อเลือก 
 * ก้จะโหลด filename,route_type,date,start,end มาเก็บไว้ในตัวแปรเพื่อเตรียมนำมาแสดงผลบนหน้าจอ
 */
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
    //directionsDisplay.setRouteIndex(parseInt(pickRouteIndex));
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
            $("#list>a:last").text("End: "+endPlace);
        }
    }); 
}

function initLoad(){
    var field,row;
    var name=[],route_type=[],pick_route=[],date=[],points_array;
    var sort_list = document.getElementById("combobox");
    var option_select;
    var value_selected = "Asc";
    //$('#combobox').val("Asc");
    
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
            $('#selectable').find("a").remove();
            for(var i=0;i<name.length;i++){
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
                $(li).append(name[i]);
                li.setAttribute("class","list-group-item");
                li.setAttribute("style","text-align: left;word-spacing: 20px;");
                $("#selectable").append(li);
            }
            $(sort_list).on('change',function(e){
                option_select = $('#combobox>option:selected',this);
                value_selected = this.value;
//                alert(value_selected);
                $("#selectable").find('a').remove();
                if(value_selected==='Asc'){
                    //alert("This is ASC fn");
                    for(var i=0;i<name.length;i++){
                        var li = document.createElement("a");
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
                        $(li).append(name[i]);
                        li.setAttribute("class","ui-widget-content");
                        li.setAttribute("style","text-align: left;word-spacing: 20px;");
                        $("#selectable").append(li);
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
            var allMapsData = $("#selectable").find("a");
            $("#t").keyup(function(){
                var len = allMapsData.length;
                var string = $('#t').val();
                $('#selectable>a:not(:contains(' + $('#t').val() + '))').hide();
                $("#selectable>a:contains("+ string +")").show();
            });
//            $("#selectable").selectable({
//                selected: function(event, ui) { 
//                    $(ui.selected).addClass("active").siblings().removeClass("ui-selected");
//                    var index = $(ui.selected).index();
//                    var number_of_points = points_array[index].length;
//                    points = [];
//                    for(var i=0;i<number_of_points;i++){
//                        points[i] = points_array[index][i];
//                    }
//                    $('#filename').text(name[index]);
//                    if(route_type[index]===1)
//                    {
//                        isOptimize = true;
//                    }else if(route_type[index]===0){
//                        isOptimize = false;
//                    }
//                    pickRouteIndex = pick_route[index];
//                }                   
//            });
            $("#selectable>a").click(function(){
                $(this).addClass("active").siblings().removeClass("active");
                var index = $(this).index();
                var number_of_points = points_array[index].length;
                points = [];
                for(var i=0;i<number_of_points;i++){
                    points[i] = points_array[index][i];
                }
                $('#filename').text(name[index]);
                if(route_type[index]===1)
                {
                    isOptimize = true;
                }else if(route_type[index]===0){
                    isOptimize = false;
                }
                pickRouteIndex = pick_route[index];
                
            });
            $("#t").keydown(function(e){
                if(e.keyCode===13&&$("#selectable>a").hasClass('active')){
                    var index = $(".active").index();
                    var number_of_points = points_array[index].length;
                    points = [];
                    for(var i=0;i<number_of_points;i++){
                        points[i] = points_array[index][i];
                    }
                    $( "#dialog" ).dialog("close");
                    $('#selectable>a').removeClass('active');
                    $('#filename').text(name[index]);
                    if(route_type[index]===1)
                    {
                        isOptimize = true;
                    }else if(route_type[index]===0){
                        isOptimize = false;
                    }
                    pickRouteIndex = pick_route[index];
                    Load();
                    return false;
                }
                else if(e.keyCode===13){
                    $("#selectable>a:visible(:contains("+ $("#t").val() +"))").first().addClass('active');
                }
            });
        }
    });
}

/*
 * addTable()
 * เป็นการโหลดค่าจาก database มาลงตารางใน tabs2
 */
function addTable(){
    var field,row;
    var name=[],route_type=[],date=[],points_array;
    $('#tablebody').find('tr:gt(0)').remove();
    $.ajax({
        type : "POST",
        url: "../php/load.php",
        success: function(d){
            row = d.split("|");
            points_array = new Array(row.length-1);
            for(var i=0;i<row.length-1;i++){
                field = row[i].split(":");
                name.push(field[0]);
                route_type.push(field[1]);
                date.push(field[3]);
                points_array[i] = new Array(2);
                for(var k=4;k<6;k++){
                    points_array[i][k-4] = field[k];
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
                $(button).addClass("btn btn-danger btn-block");
                button.setAttribute("style","width:30px;margin-left:auto;margin-right:auto;");
                $(td_delete).append(button);
//                td_delete.setAttribute("style","width=50px");
                $(td_name).append(name[i]);
                $(td_name).editable({
                    type : "text",
                    showbuttons : false,
                    mode : "inline",
                    pk : {name : ""},
                    params : function(params){
//                        params.newValue = params.value;
                        params.origValue = $(this).text();
                        return params;
                    },
                    url : "../php/editname.php"
                });
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
                $(td_date).append(date[i]);
                $(td_start).append(points_array[i][0]);
                $(td_end).append(points_array[i][1]);
//                $(tr).addClass("line");
                $(tr).append(td_delete);
                $(tr).append(td_name);
                $(tr).append(td_route);
                $(tr).append(td_date);
                $(tr).append(td_start);
                $(tr).append(td_end);
                $("#tablebody").append(tr);
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
//    return "Do you want to leave?"
//}
//
//// A jQuery event (I think), which is triggered after "onbeforeunload"
//$(window).unload(function(){
//    //I will call my method
//});

google.maps.event.addDomListener(window, 'load', initialize);