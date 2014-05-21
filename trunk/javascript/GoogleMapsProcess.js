var map, map2; // เอาไว้ initilize map-canvas จาก google
var count = "0"; // เอาไว้นับ marker เพิ่มค่าเมื่อคลิกวาง marker บน map
var directionsDisplay; // เอาไว้setDirection ที่คำนวนได้จาก directionsService ใน map หน้าแรก
var directionsDisplay2 = new google.maps.DirectionsRenderer({hideRouteList: true}); // เอาไว้แสดงข้อมูล direction ใน map2
var directionsService = new google.maps.DirectionsService(); //เอาไว้เรียก method route เพื่อหาเส้นทาง
var points = new Array(); // เอาไว้เก็บตำแหน่งของพิกัดในของ marker
var waypointMarkers = []; // เอาไว้เก็บobject Marker
var markers = []; // เอาไว้เก็บmarkerของสัญลักษณ์ของสถานที่ต่างๆ (ไม่ค่อยจำเป็นเท่าไร)
var isOptimize = false; // เอาไว้เช็คว่าการคำนวณเส้นทางเป็นแบบไหน {true:หาเส้นที่เร็วที่สุด,false:หาตามลำดับ waypoint}
var fileName = "UntitledMap"; // เอาไว้รีเซ็ตชื่อไฟล์กลับมาเป็นเหมือนเดิมโดยเรียก method resetFileName
var isCalcRoute = false; // เอาไว้เช็คว่าเรียกฟังก์ชั่น calcroute หรือยัง เอาไว้แยกเวลา เพิ่ม/เลื่อน/ลบ marker แล้ว คำนวณเส้นทางอัตโนมัติ
var findPlace; //เอาไว้หาสถานที่ใกล้เคียงกับจุดที่เราคลิก
var pickRouteIndex = 0; // เอาไว้เก็บว่าเราเลือกเส้นทางไหน ใน alternative route (ที่google แนะนำเพิ่มเติม)
var startPlace, endPlace; // เอาไว้เก็บชื่อของสถานที่เริ่มต้นกับสถานที่ที่ต้องการจะไป
var polylineOptionsActual = {
    strokeColor: '#000000',
    strokeOpacity: 0.5,
    strokeWeight: 5
};
var isLoad = false;
var map_name = new Array();
var route_type = [],
    pick_route = [],
    date = [],
    points_array = "";
var polylines_array = [],
    mapMarkers = [],
    activeIndexes = [],
    keep_path = [];
var isClearMapList = true;
var event_arrow;
/*
 * initialize() :
 * เอาไว้เซ็ตค่าเริ่มต้นให้ตัวแปรต่างๆก่อนนำไปใช้งานได้แก่
 * DirectionService, map, directionsDisplay, findPlace
 * และกำหนด eventlistener เมื่อ click บน map, check/uncheck checkbox, ค้นหา searchbox
 */
function initialize() {
    $('#reset').addClass('disabled');
    $('#hide_marker').hide("fade");
    $('#chk').iCheck('disable');
    $('#guide').addClass('disabled');
    $('#suggest').addClass('disabled');
    $('#calcroute').addClass('disabled');
    directionsDisplay = new google.maps.DirectionsRenderer({
        polylineOptions: polylineOptionsActual,
        suppressMarkers: true,
        hideRouteList: true
    });
    //  set ให้ center ของ map อยุ่ที่ BTS อารีย์
    var BTSAri = new google.maps.LatLng(13.779898, 100.544686);
    var mapOptions = {
        zoom: 12,
        center: BTSAri
    };
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById('directions-panel'));
    setUpVarFromDatabase(); //  โหลดค่าจาก database มาเก็บในตัวแปรต่างๆ
    setUpMultipleMapsTab(); //  set ค่าให้ปุ่มต่างๆที่อยู่ในหน้า multi-route
    $.ajax({
        type: "POST",
        url: "../php/check.php",
        data: {
            name: "UntitledMap"
        },
        success: function (return_value) {
            $('#filename').text(return_value);
            fileName = return_value;
        }
    });
    $('#filename').editable({
        showbuttons: false,
        highlight: "#5D9CEC",
        tpl: '<input type="text" maxlength="20" style="font-size:22px;font-weight:bold;width : 310px;height : 50px;">',
        inputclass : "test",
        mode: "inline",
        defaultValue: fileName,
        placement: "bottom",
        success: function (response, return_name) {
            fileName = return_name;
        }
    });
    
    var input = document.getElementById('address');
    var searchBox = new google.maps.places.SearchBox(input); //เอาไว้search แบบ auto complete
    //  checkbox ของ hide marker
    $('#chk').iCheck({
        checkboxClass: 'icheckbox_minimal-blue',
        increaseArea: '20%' // optional
    });
    //  ถ้า check คือ hide marker
    $('#chk').on('ifChecked', function (event) {
        for (var i = 0; i < waypointMarkers.length; i++) {
            waypointMarkers[i].setVisible(false);
        }
    });
    //  ถ้า uncheck ก็จะ set ให้ marker กลับมาโชว์เหมือนเดิม
    $('#chk').on('ifUnchecked', function (event) {
        for (var i = 0; i < waypointMarkers.length; i++) {
            waypointMarkers[i].setVisible(true);
        }
    });

    event_arrow = function (event) {
        event.preventDefault();
        if(!$('#address').is(':focus') && !$('#t').is(':focus') && !$('#searchdb').is(':focus')){
            if (event.keyCode === 37) { //Arrow Left
                var currentTab = $('#myTab1>.active');
                var index = $('#myTab1>li').index(currentTab);
                if (index === 0) {
                    $('#myTab1>li:last').find("a").trigger("click");
                } else if (index === 1) {
                    $('#myTab1>li:first').find("a").trigger("click");
                } else {
                    $('#myTab1>li').eq(1).find("a").trigger("click");
                }
            } else if (event.keyCode === 39) { //Arrow Right
                var currentTab = $('#myTab1>.active');
                var index = $('#myTab1>li').index(currentTab);
                if (index === 0) {
                    $('#myTab1>li').eq(1).find("a").trigger("click");
                } else if (index === 1) {
                    $('#myTab1>li:last').find("a").trigger("click");
                } else {
                    $('#myTab1>li:first').find("a").trigger("click");
                }
            }
        }
    };
    $('body').on("keyup",event_arrow);
    
    //  set hotkey
    var hotkey = function (event) {
        //  โดยจะใช้ปุ่มลัดได้จะต้องไม่เป็นตอนที่ textbox อยุ่ในสถานะ focus
        if (!$('#address').is(':focus') && !$('#t').is(':focus') && !$('#searchdb').is(':focus')) {
            if (event.which === 102) { // กด f เพื่อสร้างเส้นทางที่สั้นที่สุด
                $('#shRoute').trigger('click');
            } else if (event.which === 97) { // กด a เพื่อสร้างเส้นทางตามลำดับ waypoints
                $('#azRoute').trigger('click');
            } else if (event.which === 115) { // กด s เพื่อบันทึกเส้นทางที่สร้าง
                $('#save').trigger('click');
            } else if (event.which === 108) { // กด l เพื่อเรียก dialog โหลดเส้นทางที่จะโชว์
                $('#opener').trigger('click');
            } else if (event.which === 49) { // ในกรณีที่มีเส้นทางให้เลือก กด 1 เพื่อเรียกเส้นทางแรก
                $('#suggestRoute>li').eq(0).trigger('click');
            } else if (event.which === 50) { // ในกรณีที่มีเส้นทางให้เลือก กด 2 เพื่อเรียกเส้นทางแรก
                $('#suggestRoute>li').eq(1).trigger('click');
            } else if (event.which === 51) { // ในกรณีที่มีเส้นทางให้เลือก กด 3 เพื่อเรียกเส้นทางแรก
                $('#suggestRoute>li').eq(2).trigger('click');
            } else if (event.which === 103) { // กด G เพื่อดูว่าเส้นทางนี้ต้องเดินทางอย่างไร
                $('#guide').trigger('click');
            } else if (event.which === 114) { // กด R เพื่อ reset ค่าในหน้านั้นทิ้ง
                $('#reset').trigger('click');
            }
        }
    };
    $('body').keypress(hotkey); //  add event ของ hitkey ลงใน body
    $('a[data-toggle="tab"]').on('show.bs.tab', function (e) {
        if ($(e.target).text() === "Database" || $(e.target).text() === "Multiple Routes") {
            $('body').unbind('keypress', hotkey);
        } else {
            $('body').bind('keypress', hotkey);
        }
    });
    $('.editable').on('shown', function () {
        $('body').unbind('keypress', hotkey);
        $('body').off('keyup',event_arrow);
    });
    $('.editable').on('hidden', function () {
        $('body').bind('keypress', hotkey);
        $('body').on("keyup",event_arrow);
    });

    google.maps.event.addListener(searchBox, 'places_changed', function () { // เมื่อ search จะโชวmarker เป็นรูปชนิดของสถานที่ใกล้เคียง
        var places = searchBox.getPlaces();
        if($('#reset').hasClass('disabled'))
            $('#reset').removeClass('disabled');
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
    google.maps.event.addListener(map, 'click', function (event) {
        if (waypointMarkers.length < 10) {
            points.push(event.latLng.lat() + "," + event.latLng.lng());
            addWaypointToList();
            placeMarker(event.latLng, map);
            if (isCalcRoute && points.length > 2) {
                calcRoute();
            }
        } else {
            alert("Reach maximum 8 waypoints!");
        }
    });
}

/*
 * - setUpVarFromDatabase ()
 * เอาไว้ set ค่าให้กับตัวแปรต่างๆดังนี้
 *  - points_array<String> : เก็บพิกัดของจุดทั้งหมดของแผนที่นั้นทั้ง origin,destination, และ waypoint
 *  - map_name<String> : เก็บ string ชื่อของแผนที่ทั้งหมด
 *  - route_type<number> : เก็บตัวเลขว่าโหลดแบบ optimizeWaypoint เป็น true หรือ false 
 *  ถ้าเป็น true จะเก็บ 1 แต่ถ้าเป็น  false จะเก็บ 0
 *  - pick_route<number> : เก็บว่าเลือกเส้นทางไหน (ถ้ามีเส้นทางแนะนำให้เลือก) 
 *      โดย 0 คือเส้นทางที่ 1
 *          1 คือเส้นทางที่ 2
 *          2 คือเส้นทางที่ 3
 *  - date<String> : เก็บ day/month/year ว่า update ข้อมูลล่าสุดวันไหน

 */
function setUpVarFromDatabase() {
    map_name = [], route_type = [], pick_route = [], date = [], points_array = [];
    $.ajax({
        type: "POST",
        url: "../php/load.php",
        success: function (d) {
            var field, row;
            row = d.split("|");
            points_array = new Array(row.length - 1);
            for (var i = 0; i < row.length - 1; i++) {
                field = row[i].split(":");
                map_name.push(field[0]);
                route_type[i] = parseInt(field[1]);
                pick_route[i] = field[2];
                date[i] = field[3];
                if(field.length<15){
                    points_array[i] = new Array(field.length - 4);
                    for (var k = 4; k < field.length; k++) {
                        points_array[i][k - 4] = field[k];
                    }
                }else{
                    points_array[i] = new Array(field.length - 5);
                    for (var k = 4; k < field.length-1; k++) {
                        points_array[i][k - 4] = field[k];
                    }
                }
                
            }
//            alert("maps_list : "+($('#maps_list>a').length-1)+", map_name : " +map_name.length);
            if($('#maps_list>a').length-1<map_name.length){
                $('#btn-modal-maps').removeClass('disabled');
            }else{
                $('#btn-modal-maps').addClass('disabled');
            }
            console.log("setUpVar complete");
            addTable();
        }
    });
}

/*
 * addTable()
 * เป็นการโหลดค่าจาก database มาลงตารางใน tabs2
 */
function addTable() {
    $('#tablebody').find('tr').remove();    //  หา element ของ html tr เพื่อ clear ค่าเก่าทิ้งก่อน
    //  วนตามจำนวนเส้นทางที่ดึงมาจาก database เพื่อโชว์ข้อมูล
    for (var i = 0; i < map_name.length; i++) {
        var tr = document.createElement("tr");  //  สร้าง element tr ขึ้นมาเพื่อเอาไว้เก็บรายละเอียดของเส้นทางที่จะใช้ในการแสดงผลของ html
        var td_view = document.createElement("td"); //  สร้าง td เพื่อเก็บปุ่ม view
        var td_delete = document.createElement("td");   //  สร้าง td เพื่อเก็บปุ่ม delete
        var td_name = document.createElement("td"); //  สร้าง td เพื่อเก็บชื่อเส้นทาง
        var td_route = document.createElement("td");    //  สร้าง td เพื่อเก็บชนิดของเส้นทาง
        var td_date = document.createElement("td"); //  สร้าง td เพื่อเก็บวันเวลาที่ update เส้นทางนั้นๆ
        var td_start = document.createElement("td");    //  สร้าง td เพื่อเก็บจุดเริ่มต้นของเส้นทางนั้น
        var td_end = document.createElement("td");  //  สร้าง td เพื่อเก็บจุดสิ้นสุดของเส้นทางนั้น
        var button_view = document.createElement("button"); //  สร้างปุ่ม view
        var button_x = document.createElement("button");    //  สร้างปุ่ม x เพื่อ delete เส้นทางนั้นออกจาก database
        //  set ค่าให้กับปุ่ม View
        button_view.innerHTML = "View";
        $(button_view).addClass("btn btn-primary btn-block");
        button_view.setAttribute("style", "width:45px;");
        $(td_view).addClass('col-md-1');    //  add class ให้กับ td ที่เก็บปุ่ม view
        $(td_view).append(button_view); //  ใส่ปุ่ม view ลงใน td_view
        //  set ค่าให้กับปุ่ม X
        button_x.innerHTML = "X";
        $(button_x).addClass("btn btn-danger btn-block");
        button_x.setAttribute("style", "width:30px;");
        $(td_delete).append(button_x);  //  add class ให้กับ td ที่เก็บปุ่ม X
        $(td_delete).addClass('col-md-1');  //  ใส่ปุ่ม X ลงใน td_delete
        //  set ค่าให้ td ที่เก็บชื่อ
        td_name.setAttribute("style", "width:150px;");
        $(td_name).append(map_name[i]);
        $(td_name).addClass('col-md-2');
        //  เมื่อกดที่ชื่อจะมี textbox ขึ้นมาซึ่งสามารถแก้ไขชื่อเส้นทางและบันทึกชื่อนั้นลง database ได้ทันที
        $(td_name).editable({
            type: "text",
            showbuttons: false,
            mode: "inline",
            tpl: '<input type="text" maxlength="20" style="font-size:16px;font-weight:bold;width : 220px;height : 45px;">',
            pk: {
                name: ""
            },
            params: function (params) {
                params.origValue = $(this).text();
                return params;
            },
            url: "../php/editname.php",
            success: function () {
                alert("Edit name and save successfully.");
                setUpVarFromDatabase();
            }
        });
        $(td_name).on('shown', function () {
            $('body').off('keyup',event_arrow);
        });
        $(td_name).on('hidden', function () {
            $('body').on('keyup',event_arrow);
        });
        //  เนื่องจากการสร้างเส้นทางแบบตามลำดับ waypoint (A-Z route) หรือสร้างเส้นทางที่สั้นที่สุด (shot route) จะถูกเก็บในรูป 0 / 1 
        if (route_type[i] === 0) {    // โดย 0 จะเป็นการสร้างเส้นทางเป็นลำดับ
            route = "A-Z";
        } 
        else {  //  และ 1 เป็นการสร้างเส้นทางที่สั้นที่สุด
            route = "Fast";
        }
        //  set ค่าให้ td ที่เก็บ route
        $(td_route).append(route);
        $(td_route).addClass('col-md-1');
        //  set ค่าให้ td ที่เก็บ date
        $(td_date).append(date[i]);
        $(td_date).addClass('col-md-1');
        //  set ค่าให้ td ที่เก็บจุดเริ่มต้น
        $(td_start).append(points_array[i][0]);
        $(td_start).addClass('col-md-3');
        //  set ค่าให้ td ที่เก็บจุดสิ้นสุด
        $(td_end).append(points_array[i][1]);
        $(td_end).addClass('col-md-3');
        //  add แต่ละ td ลงใน tr
        $(tr).append(td_view);
        $(tr).append(td_delete);
        $(tr).append(td_name);
        $(tr).append(td_route);
        $(tr).append(td_date);
        $(tr).append(td_start);
        $(tr).append(td_end);
        //  add tr ลงใน ตารางที่มี id เป็น tablebody
        $("#tablebody").append(tr);
        //  เมื่อมีการกดปุ่ม X
        $(button_x).click(function () {
            var confirm_delete = confirm("Do you want to delete this map?");    //  confirm message เพื่อยืยยันว่าต้องการลบจริงหรือไม่
            if (confirm_delete) {  //  ถ้าต้องการลบเส้นทางนี้จริง
                var mapname = $(this).parent().next().text();
//                alert(mapname);
                var id = map_name.indexOf(mapname);
                var polyline_id = activeIndexes.indexOf(id);
                if(polyline_id !== -1){
                    polylines_array[polyline_id].setMap(null);
                    polylines_array.splice(polyline_id, 1);
                    for(var i = polyline_id+1 ; i < activeIndexes.length;i++){
                        activeIndexes[i] = activeIndexes[i]-1;
                    }
                    activeIndexes.splice(polyline_id,1);
                    
//                    alert("maps_list index : "+$('#maps_list>a:gt(0)').index($('#maps_list>.active:last'))+" map_name index : "+id);
                    if($('#maps_list>a:gt(0)').index($('#maps_list>a.active:last'))===id){
                        for(var i = 0;i< mapMarkers.length; i++){
                            mapMarkers[i].setMap(null);
                        }
                        $('#btn-guide-map2').addClass('disabled');
                    }
                    $('#maps_list').find('a:contains('+ mapname+" Hide" +')').remove();
                    if($('#maps_list>a').length === 1){
                        $('#btn-delete-map2').addClass('disabled');
                        $('#btn-reset-map2').addClass('disabled');
                    }
                }else{
                    for(var i = 0 ; i < activeIndexes.length; i++){
                        if(activeIndexes[i] > id){
                            activeIndexes[i]--;
                        }
                    }
                }
                $.ajax({
                    type: "POST",
                    async: false,
                    url: "../php/delete.php",
                    data: {
                        name: $(this).parent().parent().find("td").eq(2).text()
                    },
                    //  เมื่อลบเส้นทางสำเร็จก็ให้เรียก setUpVarFromDatabase(); ใหม่เพื่อดึงข้อมูลที่ update แล้วจาก database 
                    success: function (return_name) {
                        alert("delete " + return_name + " from database successfully.");
                        setUpVarFromDatabase();
                    },
                    error: function () {
                        alert("delete map unsucessfully.")
                    }
                });
                $(this).parent().parent().remove();
            } 
            else {  
//                alert("Cancle delete process.");
            }
        });
       //  เมื่อกดที่ปุ่ม view ให้โชว์เส้นทางที่เลือกลงบน map , add waypoint ลง list ของ position พร้อมคำนวนเส้นทางลงในหน้า maps
        $(button_view).click(function () {
            var index = map_name.indexOf($(this).parent().parent().find("td").eq(2).text());
            var lat, lng;
            isLoad = true;
            clearMap();
            for (var x = 0; x < points_array[index].length; x++) {
                points[x] = points_array[index][x];
                lat = points_array[index][x].split(",")[0];
                lng = points_array[index][x].split(",")[1];
                placeMarker(new google.maps.LatLng(lat, lng), map);
                addWaypointToList();
            }
            if (route_type[index] === 1) {
                isOptimize = true;
            } else {
                isOptimize = false;
            }
            pickRouteIndex = pick_route[index];
            $('#filename').text(map_name[index]);

            $('#myTab1 a:first').tab('show');
            var request = {
                location: new google.maps.LatLng(points[0].split(",")[0], points[0].split(",")[1]),
                types: ['establishment', 'gas_station', 'car_dealer', 'car_rental', 'car_repair', 'car_wash', 'department_store', 'shopping_mall', 'storage', 'parking'],
                rankBy: google.maps.places.RankBy.DISTANCE
            };
            findPlace.nearbySearch(request, function (results, status) {
                if (status == google.maps.places.PlacesServiceStatus.OK) {
                    startPlace = results[0].name + " " + results[0].vicinity;
                    $("#list>a:nth-child(2)").text("Start : " + startPlace);
                }
            });
            request.location = new google.maps.LatLng(points[points.length - 1].split(",")[0], points[points.length - 1].split(",")[1]);
            findPlace.nearbySearch(request, function (results, status) {
                if (status == google.maps.places.PlacesServiceStatus.OK) {
                    endPlace = results[0].name + " " + results[0].vicinity;
                    $("#list>a:last").text("End : " + endPlace);
                }
            });
            setTimeout(function () {
                calcRoute();
            }, 200);
        });

    }
    //  textbox ที่เอาไว้ search หา เส้นทาง โดยจะ search จาก ชื่อเส้นทาง , ชนิดของเส้นทาง และ วันที่ update เส้นทาง
    $('#searchdb').keyup(function () {
        var row = $('#tablebody tr');
        for (var i = 0; i < $(row).length; i++) {
            $(row[i]).find('td:gt(1):lt(3):not(:contains(' + $("#searchdb").val() + '))').parent().hide();
            $(row[i]).find('td:gt(1):lt(3):contains(' + $("#searchdb").val() + ')').parent().show();
        }
    });
}

/*
 * placeMarker()
 * ทำงานเมื่อคลิกบนmap,โหลดข้อมูลจาก database เอาไว้วาง markerบนพิกัดที่ต้องการพร้อมกับ
 * เซ็ต eventlistener เมื่อ drag,right-click บนmarker (drag=edit position,right-click=remove marker)
 *
 */
function placeMarker(position, map) {
    $('#reset').removeClass('disabled');
    var image;
    var start = $("#list>a:nth-child(2)");
    var end = $("#list").find("a:last");
    if (count == 0) {
        image = "../marker-icon-number/start.png";
    } else if (count == 1) {
        image = "../marker-icon-number/end.png";
        $('#calcroute').removeClass('disabled');
    } 
    else {
        image = "../marker-icon-number/number_" + (parseInt(count) - 1) + ".png";
    }
    var marker = new google.maps.Marker();
    marker.set("map", map);
    marker.set("position", position);
    marker.set("id", count);
    marker.set("icon", image);
    marker.set("draggable", true);
    marker.setZIndex(parseInt(count));
    marker.set("animation", google.maps.Animation.DROP);
    waypointMarkers[marker.id] = marker;
    count++;
    var request = {
        location: position,
        types: ['establishment', 'gas_station', 'car_dealer', 'car_rental', 'car_repair', 'car_wash', 'department_store', 'shopping_mall', 'storage', 'parking'],
        rankBy: google.maps.places.RankBy.DISTANCE
    };
    if (count == 1 && !isLoad) {
        findPlace.nearbySearch(request, function (results, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                startPlace = results[0].name + " " + results[0].vicinity;
                $(start).text("Start : " + startPlace);
            }
        });
    } else if (count == 2 && !isLoad) {
        findPlace.nearbySearch(request, function (results, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                endPlace = results[0].name + " " + results[0].vicinity;
                $(end).text("End : " + endPlace);
            }
        });
    }
    var index;
    //      เก็บพิกัดก่อนที่จะdrag marker เสร็จ เพื่อเอาพิกัดไปหาตำแหน่งที่เก็บใน array points ให้เจอก่อน
    //      ค่อยเปลี่ยนพิกัดนั้นเป็นพิกัดใหม่หลังจาก drag เสร็จ
    google.maps.event.addListener(marker, 'mousedown', function (event) {
        index = points.indexOf(event.latLng.lat() + "," + event.latLng.lng());
    });
    //      หลังจาก drag marker เสร็จจะอัพเดตพิกัดของ waypoint ใน listbox
    //      พร้อมอัพเดตค่าที่เก็บไว้ใน array points ด้วย
    google.maps.event.addListener(marker, 'dragend', function (event) {
        request.location = event.latLng;
        points[index] = event.latLng.lat() + "," + event.latLng.lng();
        var list = $("#list").find("a");
        if (index === 0) {
            findPlace.nearbySearch(request, function (results, status) {
                if (status == google.maps.places.PlacesServiceStatus.OK) {
                    $("#list>a").eq(1).text("Start : " + results[0].name + " " + results[0].vicinity);
                }
            });
            list.eq(index + 1).text("Start : " + startPlace);
        } else if (index === 1) {
            findPlace.nearbySearch(request, function (results, status) {
                if (status == google.maps.places.PlacesServiceStatus.OK) {
                    $("#list>a:last").text("End : " + results[0].name + " " + results[0].vicinity);
                }
            });
            list.eq(points.length).text("End : " + endPlace);
        } else {
            console.log(index - 1);
            list.eq(index).text("Waypoint " + (index - 1) + ": " + points[index]);
        }
        if (isCalcRoute) {
            calcRoute();
        }
    });
    //      ใส่ listener เมื่อคลิกขวาที่ตัว marker จะทำการลบ waypoint ของ markerนั้น ในlistbox
    //      พร้อมลบค่าพิกัดที่เก็บใน point และเอาตัว marker ออกจากarray waypointMarkers
    //      พร้อมลบ marker นั้นออกจากแมพ สุดท้ายลดค่าตัวแปร count ที่เอาไว้นับ waypoint ลงหนึ่ง
    google.maps.event.addListener(marker, "rightclick", function (event) {
        var index = points.indexOf(event.latLng.lat() + "," + event.latLng.lng());
        var waypoint = $("#list").find("a");
        //เปลี่ยนลำดับ waypoint ใน tag li ที่ index>index+1 จนถึง < length
        if (index === 0 || index === 1) {
            clearMap();
        } else {
            for (var i = index + 1, li; li = waypoint.eq(i), i < waypoint.length - 1; i++) {
                $(li).text($(li).text().replace("Waypoint " + (i - 1).toString(), "Waypoint " + (i - 2).toString()));
                image = "../marker-icon-number/number_" + (i - 2) + ".png";
                waypointMarkers[i].set("id", i - 1);
                waypointMarkers[i].setIcon(image);
            }
            waypoint.eq(index).remove();
            points.splice(index, 1);
            waypointMarkers[index].setMap(null);
            waypointMarkers.splice(index, 1);
            count--;
        }
        if (isCalcRoute) {
            calcRoute();
        }
    });
}

//เมื่อสร้าง marker หลังจากคลิ๊กบนแผนที่แล้วก็จะบันทึกพิกัดของ waypoint ลงใน list ของ position
function addWaypointToList() {
    var ul = document.getElementById("list");
    var li = document.createElement("a");
    var position = points[points.length - 1];
    li.classList.add("list-group-item");
    li.addEventListener('click', function () {
        var nodes = $("#list").find("a");
        if (this === nodes[1]) {
            map.setCenter(waypointMarkers[0].getPosition());
        } else if (this === nodes[nodes.length - 1]) {
            map.setCenter(waypointMarkers[1].getPosition());
        } else {
            map.setCenter(waypointMarkers[$(nodes).index(this)].getPosition());
        }
    });
    if ($("#list>a").length < 2) {
        li.appendChild(document.createTextNode("Start : " + position));
        ul.appendChild(li);
    } else if ($("#list>a").length === 2) {
        li.appendChild(document.createTextNode("End : " + position));
        ul.appendChild(li);
    } else {
        li.appendChild(document.createTextNode("Waypoint " + (points.indexOf(position) - 1) + ": " + position));
        ul.insertBefore(li, ul.childNodes[ul.childNodes.length - 1]);
    }
}

/*
 * shRoute,azRoute เอาไว้เรียกเมื่อกดปุ่ม Short Route,A-Z Route ตามลำดับ ซึ่งจะมีวิธีการคำนวณเส้นทางต่างกันคือ
 * Short Route จะคำนวณเส้นทางสั้นที่สุด
 * A-Z จะคำนวณตามลำดับของ waypoints
 */

function shRoute() {
    isOptimize = true;
    calcRoute();
}

function azRoute() {
    isOptimize = false;
    calcRoute();
}

/*
 * calcRoute()
 * เอาไว้ส่ง start,end,waypoint ทั้งหมดให้ google render เส้นทางออกมาให้
 * ผ่าน method DirectionsService.route และให้ directionsDisplay.setDirection(ผลลัพธ์ที่ได้จาก callback function)
 */
function calcRoute() {
    $('#guide').removeClass('disabled');
    isCalcRoute = true;
    //  directionsService = new google.maps.DirectionsService();
    var wps = [];
    for (var i = 2; i < points.length; i++) {
        wps.push({
            location: points[i],
            stopover: true
        });
    }
    var request = {
        origin: points[0],
        destination: points[1],
        waypoints: wps,
        provideRouteAlternatives: true,
        optimizeWaypoints: isOptimize,
        travelMode: google.maps.TravelMode.DRIVING
    };
    directionsService.route(request, function (response, status) {
        var bound = new google.maps.LatLngBounds();
        var lat, lng;
        var latlng;
        for (var i = 0; i < points.length; i++) {
            lat = points[i].split(",")[0];
            lng = points[i].split(",")[1];
            latlng = new google.maps.LatLng(lat, lng);
            bound.extend(latlng);
        }
        if (status == google.maps.DirectionsStatus.OK) {
            $('#suggestRoute>li').remove();
            if (response.routes.length > 1) {
                for (var i = 0; i < response.routes.length; i++) {
                    var li = document.createElement("li");
                    var a = document.createElement("a");
                    $(a).attr('href="#"');
                    $(a).append(response.routes[i].summary + " " + response.routes[i].legs[0].distance.text + " " + response.routes[i].legs[0].duration.text);
                    $(li).append(a);
                    $('#suggest').removeClass('disabled');
                    $('#suggestRoute').append(li);
                }
                directionsDisplay.setDirections(response);
                directionsDisplay.setRouteIndex(parseInt(pickRouteIndex));
                $('#suggestRoute>li').click(function () {
                    directionsDisplay.setDirections(response);
                    if ($('#suggestRoute>li').index(this) == 0) {
                        directionsDisplay.setRouteIndex(0);
                        pickRouteIndex = 0;
                    } else if ($('#suggestRoute>li').index(this) == 1) {
                        directionsDisplay.setRouteIndex(1);
                        pickRouteIndex = 1;
                    } else {
                        directionsDisplay.setRouteIndex(2);
                        pickRouteIndex = 2;
                    }
                });
            } else {
                directionsDisplay.setDirections(response);
                $('#suggest').addClass('disabled')
            }
            map.fitBounds(bound);
            $('#myTab1 a:first').tab('show');
            $('#hide_marker').show("fade");
            $('#chk').iCheck('enable');
        }else if(status == google.maps.DirectionsStatus.ZERO_RESULTS){
            alert("No route could be found between the origin and destination.");
        }else if(status == google.maps.DirectionsStatus.NOT_FOUND){
            alert("At least one of the origin, destination, or waypoints could not be geocoded.");
        }else if(status == google.maps.DirectionsStatus.UNKNOWN_ERROR){
            alert("A directions request could not be processed due to a server error. The request may succeed if you try again.");
        }else if(status == google.maps.DirectionsStatus.REQUEST_DENIED){
            alert("The webpage is not allowed to use the directions service.");
        }else if(status == google.maps.DirectionsStatus.INVALID_REQUEST){
            alert("The DirectionsRequest provided was invalid.");
        }
    });
}

//  เก็บ path ทั้งหมดไว้ใน array แล้วส่งค่า array นั้นไปให้ function save เพื่อเก็บ path นั้นลง database
function pushPath() {
    var confirm_save = confirm("Do you want to save this map?");
    if (confirm_save === true) {
        if (points.length === 1) {
            alert("Please enter end points.");
            return false;
        } else if (points.length === 0) {
            alert("Please enter start and end points.");
            return false;
        }
        else{
            var wps = [],
                path = "";
            var temp = "";
            $('#md-progressbar').modal({backdrop:"static"});
            var count = 0;
            for (var j = 2; j < points.length; j++) {
                wps.push({
                    location: points[j],
                    stopover: true
                });
            }
            var request = {
                origin: points[0],
                destination: points[1],
                waypoints: wps,
                optimizeWaypoints: isOptimize,
                travelMode: google.maps.TravelMode.DRIVING
            };
            directionsService.route(request, function (response, status) {
                if (status == google.maps.DirectionsStatus.OK) 
                {
                    var arr = new Array();
                    for (var j = 0; j < response.routes[0].legs.length; j++) {
                        for (var i = 0; i < response.routes[0].legs[j].steps.length; i++) {
                            for (var k = 0; k < response.routes[0].legs[j].steps[i].path.length; k++) {
                                temp = response.routes[0].legs[j].steps[i].path[k].toString().replace(" ", "");
                                temp = temp.replace("(", "");
                                temp = temp.replace(")", "");
                                path = path + temp + "/";
                                count++;
                            }
                        }
                    }
                    console.log("Path : "+count);
                    path = path.substring(0, path.length - 1);
                    Save(path);
                }
                else {
                    alert(status);
                }   
            });
        }
    }else {
        alert("Cancle save process.");
    }
}

/*
 * Save()
 * นำค่า filename,route_type,pickRouteIndex,points เก็บลง database ผ่าน ajax called
 * พร้อมกับ refresh ค่าในตาราง tab2
 */
function Save(path) {
    var route_type;
    pickRouteIndex = directionsDisplay.getRouteIndex();
    if (isOptimize) {
        route_type = 1;
    } else {
        route_type = 0;
    }
    if (points.length < 2) {
        alert("Please insert start-end point.");
        return false;
    }
    fileName = $('#filename').text();
    $.ajax({
        type: "POST",
        url: "../php/save.php",
        data: ({
            name: fileName,
            route_type: route_type,
            pick_route: pickRouteIndex,
            latlng: points,
            path: path
        }),
        success: function (return_message) {
            setUpVarFromDatabase();
            $('#md-progressbar').modal('hide');
            alert(return_message);
        },
        error: function (xhr, status, error) {
            alert(xhr.responseText);
            alert("Save file to database unsuccessfully.");
        }
    });
}

/*
 * ทำงานเมื่อกดปุ่ม RESET จะทำการเริ่ม reset ค่า count,array points ใหม่, ลบmarker ออกจากแผนที่ให้หมด
 *  และเคลียร์ค่า input ของ textbox พร้อมทั้งลด waypoint ที่เก็บใน listbox ทั้งหมด
 * @returns {undefined}
 */
function clearMap() {
    $('#reset').addClass('disabled');
    $('#hide_marker').hide("fade");
    $('#chk').iCheck('disable');
    directionsDisplay.setMap(null);
    directionsDisplay.setPanel(null);
    $('#suggestRoute').children().remove();
    points = [];
    isCalcRoute = false;
    count = 0;
    $('#address').val('');
    for (var i = 0; i < waypointMarkers.length; i++) {
        waypointMarkers[i].setMap(null);
    }
    for(var i = 0; i < markers.length ; i++){
        markers[i].setMap(null);
    }
    var BTSAri = new google.maps.LatLng(13.779898, 100.544686);
    var mapOptions = {
        zoom: 12,
        center: BTSAri
    };
    map.setOptions(mapOptions);
    waypointMarkers = [];
    var list = $("#list").find("a");
    for (var i = list.length - 1, li; li = list.eq(i), i > 0; i--) {
        li.remove();
    }
    directionsDisplay = new google.maps.DirectionsRenderer({
        polylineOptions: polylineOptionsActual,
        suppressMarkers: true,
        hideRouteList: true
    });
    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById('directions-panel'));
    $('#chk').iCheck('uncheck');
    $('#guide').addClass('disabled');
    $('#calcroute').addClass('disabled');
    $('#suggest').addClass('disabled');
}

/*
 * InitLoad() -> Load() (InitLoad จะต้องเรียกก่อน Load เสมอ)
 * โดย InitLoad() จะถูกเรียกเมื่อกดปุ่ม load หรือกด l ในหน้าของ Maps
 * เรียก modal dialog ที่สามารถ search ข้อมูลไฟล์ที่ต้องการจะโหลดได้ เมื่อคลิก/ใส่ข้อความใน searchbox เพื่อเลือก
 * ก้จะโหลด filename,route_type,date,start,end มาเก็บไว้ในตัวแปรเพื่อเตรียมนำมาแสดงผลบนหน้าจอ
 */
function initLoad() {
    $('#doLoad').addClass('disabled');
    var sort_list = $('.dropdown-menu').parent();
    var t = $('#t');
    var filename = $('#filename');
    $('#selectable').find("a").remove();
    for (var i = 0; i < map_name.length; i++) {
        var li = document.createElement("a");
        var route;
        $(li).append(date[i] + " ");
        if (route_type[i] == 0) {
            route = "A-Z"
            $(li).append(route + " ");
        } else {
            route = "Fast "
            $(li).append(route);
        }
        $(li).append(map_name[i]);
        li.setAttribute("class", "list-group-item");
        li.setAttribute("style", "text-align: left;word-spacing: 20px;");
        $("#selectable").append(li);
    }
    $(sort_list).on('show.bs.dropdown', function (e) {
        $('#Asc').on('click', function () {
            $("#selectable").find('a').remove();
            $('#order').text("Ascending");
            for (var i = 0; i < map_name.length; i++) {
                var li = document.createElement("a");
                $(li).attr("href='#'");
                $(li).addClass("list-group-item");
                var route;
                $(li).append(date[i] + " ");
                if (route_type[i] == 0) {
                    route = "A-Z"
                    $(li).append(route + " ");
                } else {
                    route = "Fast "
                    $(li).append(route);
                }
                $(li).append(map_name[i]);
                li.setAttribute("class", "list-group-item");
                li.setAttribute("style", "text-align: left;word-spacing: 20px;");
                $(li).click(function () {
                    $(this).addClass("active");
                    $(this).siblings().removeClass("active");
                });
                $("#selectable").append(li);
            }
        });
        $('#Dsc').on('click', function () {
            $("#selectable").find('a').remove();
            $('#order').text("Descending");
            for (var i = map_name.length - 1; i >= 0; i--) {
                var li = document.createElement("a");
                $(li).attr("href='#'");
                var route;
                $(li).append(date[i] + " ");
                if (route_type[i] === 0) {
                    route = "A-Z";
                    $(li).append(route + " ");
                } else {
                    route = "Fast ";
                    $(li).append(route);
                }
                $(li).append(map_name[i]);
                li.setAttribute("class", "list-group-item");
                li.setAttribute("style", "text-align: left;word-spacing: 20px;");
                $(li).click(function () {
                    $(this).addClass("active");
                    $(this).siblings().removeClass("active");
                });
                $("#selectable").append(li);
            }
        });
    });
    var allMapsData = $("#selectable");
    $(t).keyup(function () {
        var len = allMapsData.length;
        var string = $(t).val();
        allMapsData.find('a:not(:contains(' + string + '))').hide();
        allMapsData.find("a:contains(" + string + ")").show();
    });
    $(allMapsData).find("a").click(function () {
        $(this).addClass("active").siblings().removeClass("active");
        $('#doLoad').removeClass('disabled');
        var index = $(this).index();
        var number_of_points = points_array[index].length;
        points = [];
        for (var i = 0; i < number_of_points; i++) {
            points[i] = points_array[index][i];
        }
        $(filename).text(map_name[index]);
        if (route_type[index] === 1) {
            isOptimize = true;
        } else if(route_type[index] === 0) {
            isOptimize = false;
        }
        pickRouteIndex = pick_route[index];

    });
    $(t).keydown(function (e) {
        if (e.keyCode === 13 && $(allMapsData).find('a').hasClass('active')) {
            var index = $(allMapsData).find('a.active').index();
            var number_of_points = points_array[index].length;
            points = [];
            for (var i = 0; i < number_of_points; i++) {
                points[i] = points_array[index][i];
            }
            $(allMapsData).find('a').removeClass('active');
            $(filename).text(map_name[index]);
            if (route_type[index] === 1) {
                isOptimize = true;
            } else if (route_type[index] === 0) {
                isOptimize = false;
            }
            pickRouteIndex = pick_route[index];
            directionsDisplay.setPanel(null);
            $("#doLoad").trigger('click');
            return false;
        } else if (e.keyCode === 13) {
            $(allMapsData).find("a:visible(:contains(" + $("#t").val() + "))").first().addClass('active').siblings().removeClass('active');
        }
    });
}

/*
 * Load() จะถูกเรียกจาก InitLoad()
 * มีหน้าที่แสดงเส้นทางที่เลือกพร้อมคำนวนเส้นทางลงบน map
 */
function Load() {
    var lat, lng;
    var points_temp = [];
    isLoad = true;
    for (var i = 0; i < points.length; i++) {
        points_temp.push(points[i]);
    }
    clearMap();
    for (var i = 0; i < points_temp.length; i++) {
        points.push(points_temp[i]);
        lat = points[i].split(",")[0];
        lng = points[i].split(",")[1];
        placeMarker(new google.maps.LatLng(lat, lng), map);
        addWaypointToList();
    }
    calcRoute();
    var request = {
        location: new google.maps.LatLng(points[0].split(",")[0], points[0].split(",")[1]),
        types: ['establishment', 'gas_station', 'car_dealer', 'car_rental', 'car_repair', 'car_wash', 'department_store', 'shopping_mall', 'storage', 'parking'],
        rankBy: google.maps.places.RankBy.DISTANCE
    };
    findPlace.nearbySearch(request, function (results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            startPlace = results[0].name + " " + results[0].vicinity;
            $("#list>a:nth-child(2)").text("Start : " + startPlace);
        }
    });
    request.location = new google.maps.LatLng(points[points.length - 1].split(",")[0], points[points.length - 1].split(",")[1]);
    findPlace.nearbySearch(request, function (results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            endPlace = results[0].name + " " + results[0].vicinity;
            $("#list>a:last").text("End : " + endPlace);
        }
    });
}

/*
 * resetFileName()
 * เป็นการ reset ชื่อไฟล์กลับไปเป็นค่าเดิม
 */
function resetFileName() {
    $('#filename').text(fileName);
}
/*
 * - setUpMultisetUpMultipleMapsTab
 *  สร้าง map2 มาบน tab ใหม่และset eventlistener 
 *  ให้กับปุ่มต่างๆ
 */
function setUpMultipleMapsTab() {
    //  ให้ center ของ map ในหน้า Multi-Route อยู่ที่ Bts อารีย์
    var BTSAri = new google.maps.LatLng(13.779898, 100.544686);
    map2 = new google.maps.Map(document.getElementById('map-canvas-2'), {
        zoom: 12,
        center: BTSAri
    });
    directionsDisplay2.setMap(map2);
    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        google.maps.event.trigger(map2, 'resize');
    });
    //  set ค่าให้ปุ่ม guide , remove some routes from map list และ reset เป็น disable
    $('#btn-guide-map2').addClass('disabled');
    $('#btn-delete-map2').addClass('disabled');
    $('#btn-reset-map2').addClass('disabled');
//    setTimeout(function(){
//        if(map_name.length===0)
//            $('#btn-modal-maps').addClass('disabled');
//    },1000);
    
    //  เรียก function เพื่อ add event ให้กับปุ่มต่างๆ
    addEventListener_Btn_MultipleMapsTab();
}

/*
 * - addEventListener_Btn_MultipleMapsTab()
 * set event ให้กับปุ่มต่างๆดังนี้
 *  - ปุ่ม Load Multiple Routes
 *  - ปุ่ม Delete Some Routes 
 *  - ปุ่ม Reset
 *  - ปุ่ม Guide
 */
function addEventListener_Btn_MultipleMapsTab() {
    //  เมื่อกด Load Multiple Routes จะเรียก dialog เพื่อ load หลายๆ route มาโชว์
    $("#btn-modal-maps").click(function () {
        $('#md-select-route').modal();
        setUpModalMultipleMapsTab();
        addEventListener_Modal_MultipleMapsTab();
    });
    //  เมื่อกด Delete Some Routes จะเป็นการนำเส้นทาง / polylines เส่นที่เลือกไว้ออกจาก map list
    $("#btn-delete-map2").click(function () {
        //  วนหาว่ามี polylines เส้นไหนที่เลือกไว้บ้าง? ซึ่งเส้นที่เลือกจะเป็นเส้นสีแดง
        $("#btn-delete-map2").addClass("disabled");
        for (var i = 0; i < polylines_array.length; i++) {
            if (polylines_array[i].strokeColor == 'red') {
                //  set polyline นั้นออกจาก map
                polylines_array[i].setMap(null);
                //  เอา map นั้นออกจาก list ที่เราโชว์ไว้
                $('#maps_list>a').eq(i + 1).remove();
                //  เอา polyline เส้นนั้นออกจาก polylines_array
                polylines_array.splice(i, 1);
                //  เอาตำแหน่งของ polyline ที่ activeIndexes เก็บไว้ออก
                activeIndexes.splice(i, 1);
                //  set ให้ i=-1 เพื่อให้กลับมาวนใหม่อีกรอบ เพราะเมื่อมีการ splice ค่าออกมาจะทำให้ตำแหน่งของค่า i เปลี่ยน จนต้องวนใหม่อีกรอบเพื่อจะให้ค่าที่เลือกไว้ออกทุกตัว
                i = -1;
            }
        }
        if($('#maps_list>a').length-1>=map_name.length){
            $('#btn-modal-maps').addClass('disabled');
        }
        else 
            $('#btn-modal-maps').removeClass('disabled');
        if($('#maps_list>a').length-1===0){
            $("#btn-reset-map2").addClass("disabled");
        }
    });
    //  เมื่อกด Reset จะทำการล้างค่าทุกค่าใน map list และบน map
    $('#btn-reset-map2').click(function () {
        $('#btn-guide-map2').addClass('disabled');
        $('#btn-delete-map2').addClass('disabled');
        $('#btn-reset-map2').addClass('disabled');
        $('#btn-modal-maps').removeClass('disabled');
        $('#md-btn-select-all').removeClass('disabled');
        //  set ทุก polyline ออกจาก map
        for (var i = 0; i < polylines_array.length; i++) {
            polylines_array[i].setMap(null);
        }
        //  ล้างค่า map list ทั้งหมด
        $('#maps_list>a:gt(0)').remove();
        //  set marker ออกจาก map
        for (var i = 0; i < mapMarkers.length; i++) {
            mapMarkers[i].setMap(null);
        }
        //  ล้างค่า mapMarker
        mapMarkers = [];
        $('#md-list-maps>a').removeClass('active');
        //  ล้างค่าใน array activeIndexes และ polylines_array ออกทัง้หมด
        activeIndexes = [];
        polylines_array = [];
    });
    //  เมื่อกด Guide จะเป็นการแสดงการเดินทางในเส้นที่ได้เลือกไว้
    $('#btn-guide-map2').click(function () {
        if ($('#maps_list>.active').length > 1) {
            $('#direction').modal({
                keyboard: true
            });
            var text = $("#maps_list>a.active:gt(0)").text().replace(" Hide", "");
            text = text.replace(" ", "");
            var id = map_name.indexOf(text);
            var wps = [];
            for (var i = 2; i < points_array[id].length; i++) {
                wps.push({
                    location: points_array[id][i],
                    stopover: true
                });
            }
            var request = {
                origin: points_array[id][0],
                destination: points_array[id][1],
                waypoints: wps,
                provideRouteAlternatives: true,
                optimizeWaypoints: isOptimize,
                travelMode: google.maps.TravelMode.DRIVING
            };
            if (route_type[id] === 1) {
                isOptimize = true;
            } else if (route_type[id] === 0) {
                isOptimize = false;
            }
            directionsDisplay2.setMap(null);
            directionsDisplay2.setPanel(null);
            directionsDisplay2.setPanel(document.getElementById('directions-panel'));
            directionsService.route(request, function (response, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    directionsDisplay2.setDirections(response);
                    directionsDisplay2.setRouteIndex(parseInt(pick_route[id]));
                }
            });
        }
    });
}

/*
 *  - setUpModalMultipleMapsTab ()
 *      ใส่ชื่อmapและรายละเอียดของเส้นทางลงใน modal-dialog เพื่อโหลดเส้นทางหลายๆเส้นมาโชว์
 * @returns {undefined}
 */

function setUpModalMultipleMapsTab() {
    $('#md-list-maps').find('a').remove();
    var mapslist = $('#maps_list>a:gt(0)');
    for (var i = 0; i < map_name.length; i++) {
        if ($("#maps_list>a:gt(0):contains("+ map_name[i]+" Hide" +")").length===0){
            var li = document.createElement("a");
            var route;
            $(li).append(date[i] + " ");
            if (route_type[i] === 0) {
                route = "A-Z";
                $(li).append(route + " ");
            } 
            else {
                route = "Fast ";
                $(li).append(route);
            }
            $(li).append(map_name[i]);
            li.setAttribute("class", "list-group-item");
            li.setAttribute("style", "text-align: left;word-spacing: 20px;");
            $("#md-list-maps").append(li);
        } 
        else {

        }
    }
}

//  ใส่ event ให้กับปุ่มต่างๆที่อยู่ใน dialog ที่มาจากการกดปุ่ม Load Multiple Routes
function addEventListener_Modal_MultipleMapsTab() {
    $('#md-btn-load').addClass('disabled');
    $('#md-btn-select-all').removeClass('disabled'); 
    //  เมื่อกดเลือกเส้นทาง จะทำการนับและแสดงผลตรงปุ่มโหลดว่าตอนนี้เลือกมากี่เส้นทางแล้ว
    var event_list_maps = function () {
        var count;
        var badge_count = $('#badge-count');
        if ($(this).hasClass("active")) {
            $(this).removeClass("active");
            count = parseInt($(badge_count).text()) - 1;
            $(badge_count).text(count);
            $('#md-btn-select-all').removeClass('disabled');
            if(count===0)
                $('#md-btn-load').addClass('disabled');
            else
                $('#md-btn-load').removeClass('disabled');
        } 
        else {
            $(this).addClass("active");
            count = parseInt($(badge_count).text()) + 1;
            $(badge_count).text(count);
            $('#md-btn-load').removeClass('disabled');
            if(count===$('#md-list-maps').find("a").length)
                $('#md-btn-select-all').addClass('disabled'); 
        }
    };
    //  เมื่อกดปุ่ม load ก้โหลดเส้นทางนั้นลงบน map และแสดงชื่อเส้นทางลง map list
    var event_btn_load = function () {
        $('#badge-count').text("0");
        var multipleRoute = $('#md-list-maps>.active');
        var strings_array = [];
        console.log("Begin load .....");
        for (var i = 0; i < multipleRoute.length; i++){
            var string_map_name = "";
            var split_size = $(multipleRoute[i]).text().split(" ").length;
            if (split_size > 3) {
                var extend = $(multipleRoute[i]).text().split(" ");
                string_map_name = extend[2];
                for (var k = 3; k < split_size; k++) {
                    string_map_name = string_map_name + " " + extend[k];
                }
            } else {
                string_map_name = $(multipleRoute[i]).text().split(" ")[2];
            }
            strings_array.push(string_map_name);
            
            var index = map_name.indexOf(string_map_name);
            activeIndexes.push(index);
            addMapToList(index);
        }
        $.ajax({
            type: "POST",
            data: ({
                name: strings_array
            }),
            url: "../php/fetchPath.php",
            success: function (d) {
                var paths_array = d.split(":");
                for (var i = 0; i < paths_array.length - 1; i++) {
                    var path = [];
                    var string_path = paths_array[i].split("/");
                    console.log("round " + i + " : " + string_path.length + " pts");
                    var latlng = "";
                    for (var j = 0; j < string_path.length; j++) {
                        latlng = string_path[j].split(",");
                        path.push(new google.maps.LatLng(latlng[0], latlng[1]));
                    }
                    var polyline = new google.maps.Polyline({
                        path: path,
                        strokeOpacity: 0.6,
                        strokeWeight: 2
                    });
                    polyline.setMap(map2);
                    polylines_array.push(polyline);

                }
                console.log("Finished load .....");
                var event_select_maps_list = function (event) {
                    event.preventDefault();
                    if (event.keyCode === 219) { // [
                        var currentMap = $('#maps_list>.active:gt(0)');
                        var allMapsList = $('#maps_list>a:gt(0)');
                        var index = $(allMapsList).index(currentMap);
                        if (index === -1) { //Didn't select yet
                            alert("Didn't selected");
                        } else { //Already selected
                            if ($(currentMap).prev() != $('#maps_list>.active:first')) {
                                var target = $(currentMap).prev();
                                $(target).trigger('click');
                            }
                        }
                    } else if (event.keyCode === 221) { // ]
                        var currentMap = $('#maps_list>.active:gt(0)');
                        var allMapsList = $('#maps_list>a:gt(0)');
                        var index = $(allMapsList).index(currentMap);
                        if (index === -1) { //Didn't select yet
                            alert("Didn't selected");
                        } else { //Already selected
                            if ($(allMapsList).index($(currentMap).next()) !== -1) {
                                var target = $(currentMap).next();
                                $(target).trigger('click');
                            }

                        }
                    } else if (event.keyCode === 72) { // H
                        var currentMap = $('#maps_list>.active:gt(0)');
                        var targetChk = $(currentMap).find("input:last");
                        $(targetChk).iCheck('toggle');
                    }
                };
                $('body').unbind('keyup').keyup(event_select_maps_list);
                $('a[data-toggle="tab"]').on('show.bs.tab', function (e) {
                    if ($(e.target).text() === "Database" || $(e.target).text() === "Maps") {
                        $('body').unbind('keyup', event_select_maps_list);
                    } else {
                        $('body').unbind('keyup').keyup(event_select_maps_list);
                    }
                });
                $('#btn-reset-map2').removeClass('disabled');
                if($('#maps_list>a').length-1===map_name.length){
                    $('#btn-modal-maps').addClass('disabled');
                }
                else
                    $('#btn-modal-maps').removeClass('disabled');
            }
        });
        
    };
    var event_btn_all_load = function () {
        var list_maps = $('#md-list-maps').find("a");
        $(list_maps).addClass("active");
        $('#badge-count').text($(list_maps).length);
        $('#md-btn-select-all').addClass('disabled');
        $('#md-btn-load').removeClass('disabled');
    };
    var event_btn_close = function () {
        $('#badge-count').text("0");
    };
    $('#md-list-maps').find("a").unbind("click").click(event_list_maps);
    $('#md-btn-load').unbind("click").click(event_btn_load);
    $('#md-btn-select-all').unbind("click").click(event_btn_all_load);
    $('#md-btn-close').unbind("click").click(event_btn_close);
}


/*
 *  - addMapToList
 *  เอาไว้ add map เข้าไปใน map_list ทีละ map    
 * @param {number} index
 *  - index : คือตำแหน่งของชื่อ map ที่อยู่ใน array map_name ที่จะ add เข้าไปในlist 
 * @returns {undefined}
 */
function addMapToList(index) {
    var list = document.getElementById("maps_list");
    var a = document.createElement("a");
    var label = document.createElement("label"); //  สร้างเพื่อใส่ checkbox ในที่นี้คือ checkbox ของ hide
    var label_x = document.createElement("label"); //  สร้างเพื่อใส่ checkbox ในที่นี้คือ checkbox ที่เอาไว้เลือกลบ map list นั้นๆ
    //  checkbox ของ hide
    var chk = document.createElement("input");
    chk.setAttribute("type", "checkbox");
    //  checkbox เพื่อเอาเส้นทางนั้นออกจาก map list
    var chk_x = document.createElement("input");
    chk_x.setAttribute("type", "checkbox");
    //  ใส่ checkbox ลงใน label
    label.appendChild(chk);
    label_x.appendChild(chk_x);
    label.appendChild(document.createTextNode(" Hide")); //  ใส่ text ลงใน label
    label.setAttribute("class", "hide-route"); //  ใส่ class ให้ label
    a.classList.add("list-group-item"); //  ใส่ class ให้ a
    //  ใส่ชื่อของเส้นทางและ label ต่างๆลงใน a
    a.appendChild(label_x);
    a.appendChild(document.createTextNode(" " + map_name[index]));
    a.appendChild(label);
    //  ใส่ a ลงใน list
    list.appendChild(a);
    //  เรียก function เพื่อเพิ่ม event ต่างๆให้ตัวแปรที่อยู่ใน map list
    addEventListener_MapList_MultipleMapsTab(list, chk, a, chk_x);
}

/*
 * - addEventListener_MapList_MultipleMapsTab()
 *  เอาไว้ addlistener ให้กับ list แสดง map ต่างๆที่โหลดมาแสดงผล
 * @param {Node:"List"} list : เป็นlist ที่เก็บ map
 * @param {Node:"input type=checkbox"} : เป็น checkbox ทีเอาไว้ซ่อน map จากแผนที่
 * @param {Node:"a"} a : เป็น element tag a ที่กำหนดแต่ละแถวในlist
 * @param {Node:"input type=checkbox"} chk_x : เป็น checkbox ที่เอาไว้ลบแต่ละmapออกจากlist
 * @returns {undefined}
 */
function addEventListener_MapList_MultipleMapsTab(list, chk, a, chk_x) {
    //  ตัวแปรเก็บ event ของ a
    var event_a = function () {
        $('#btn-guide-map2').removeClass('disabled');
        var bounds = new google.maps.LatLngBounds(); //  เพื่อกำหนดขอบเขตของบริเวณเส้นทาองที่เราเลือก
        //  ดึงชื่อที่อยุ่ใน a ออกมา
        var text = $(this).text().replace(" ", "");
        text = text.replace(" Hide", "");
        var id = map_name.indexOf(text); //  ให้ id เป็นตำแหน่งของชื่อเส้นทางที่เราเลือกจากเส้นทางทั้งหมดใน database
        var polyline_id = activeIndexes.indexOf(id); //  เก็บค่า index ของ polyline ที่สัมพันธ์กับช่องที่คลิก
        //  เก็บค่า latitude longitude ของจุด start ของเส้นทางที่เราเลือก
        var lat = points_array[id][0].split(",")[0];
        var lng = points_array[id][0].split(",")[1];
        //  แปลงค่า lat lng ที่เป็น string ให้อยู่ในรูปของตัวแปร LatLng
        var position = new google.maps.LatLng(lat, lng);
        //  set center ของเส้นทางที่เราเลือก โดยใช้จุด start ของเส้นทางนั้น
        map2.setCenter(position);
        $(this).addClass('active').siblings(':gt(0)').removeClass('active');
        polylines_array[polyline_id].setVisible(true); //  ให้ polyline นั้นปรากฎขึ้นบน map
        $(chk).iCheck('uncheck'); //  set ให้ uncheck ที่ checkbox ที่เอาไว้สำหรับ hide เส้นทางนั้นๆ
        //  วนเพื่อกำหนดสีเส้นทางว่าเป็นเส้นทางที่เราคลิกเลือกเพื่อต้องการโชว์ให้เด่นหรือไม่?
        for (var i = 0; i < polylines_array.length; i++) {
            //  ถ้าเป็นเส้นทางที่ไม่ถูกเลือก
            if (i !== polyline_id) {
                //  ถ้าเป็นเส้นทางที่ไม่ได้ถูก checkbox ให้เอาเส้นทางนั้นออกจาก map list ซึ่งเส้นนั้นจะเป็นเส้นสีแดง ให้คงเส้นทางนั้นเป็นสีดำปกติ
                if (polylines_array[i].strokeColor != 'red'){
                    polylines_array[i].setOptions({
                        strokeColor: "black",
                        strokeOpacity: 0.6,
                        strokeWeight: 2
                    });
                }
            }
            //  ถ้าเป็นเส้นทางที่ user ต้องการโชว์ให้เด่น เส้นนั้นจะถูกเปลี่ยนเป็นสีน้ำเงิน และ clear ให้ checkbox ของการเอาเส้นทางนั้นออกจาก map list เป็น uncheck
            else {
                $(chk_x).iCheck('uncheck');
                polylines_array[i].setOptions({
                    strokeColor: "blue",
                    strokeOpacity: 0.6,
                    strokeWeight: 5
                });
            }
        }
        //  นำ mapMarker ออกจาก map
        for (var i = 0; i < mapMarkers.length; i++) {
            mapMarkers[i].setMap(null);
        }
        mapMarkers = []; //  clear ใน mapMaker ออก
        //  ทำการสร้าง mapMarker ลงบน map ใหม่ตามเส้นทางที่เราเลือก
        var image = "../marker-icon-number/start.png";
        while (mapMarkers.length < points_array[id].length) {
            position = new google.maps.LatLng(points_array[id][mapMarkers.length].split(",")[0], points_array[id][mapMarkers.length].split(",")[1]);
            bounds.extend(position);
            var marker = new google.maps.Marker({
                position: position,
                map: map2,
                icon: image,
                animation: google.maps.Animation.DROP
            });
            mapMarkers.push(marker);
            if (mapMarkers.length === 1) {
                image = "../marker-icon-number/end.png";
            } else {
                image = "../marker-icon-number/number_" + (parseInt(mapMarkers.length) - 1) + ".png";
            }
        }
        //  กำหนดของเขตของเส้นทางที่เราเลือกให้อยู่ในระยะและขนาดที่พอดีกับ map
        map2.fitBounds(bounds);
    };
    //  กำหนด class และขนาดให้ checkbox ที่จะเอาเส้นทาองออกจาก map list
    $(chk_x).iCheck({
        checkboxClass: 'icheckbox_minimal-blue',
        increaseArea: '10%' // optional
    });
    //  ถ้า checkbox ที่จะเอาเส้นทางออกจาก map list เป็น check
    $(chk_x).on('ifChecked', function () {
        if ($('#btn-delete-map2').hasClass('disabled'))
            $('#btn-delete-map2').removeClass('disabled');
        var id = $(list).find("a").index($(chk_x).parent().parent().parent()) - 1; //  ตำแหน่งของเส้นทางที่เราเลือกอยู่บน map list ที่เรา check
        //  ถ้าไม่เป็น class active หรือไม่ใช่เส้นสีฟ้า ให้ set polyline เป็นเส้นสีแดง
        if (!$(this).parent().parent().parent().hasClass('active')) {
            polylines_array[id].setOptions({
                strokeColor: "red",
                strokeOpacity: 0.6,
                strokeWeight: 4
            });
        }
        //  ถ้าเป็น class active จะเอา class active ออก พร้อมเอา mapMarker ออกจาก map และค่อยเปลี่ยนเส้นเป็น polyline จากสีฟ้าเป็นแดง
        else {
            $(this).parent().parent().parent().removeClass('active');
            if ($('#maps_list>.active').length === 1)
                $('#btn-guide-map2').addClass('disabled');
            polylines_array[id].setOptions({
                strokeColor: "red",
                strokeOpacity: 0.6,
                strokeWeight: 4
            });
            for (var i = 0; i < mapMarkers.length; i++) {
                mapMarkers[i].setVisible(false);
            }
        }
    });
    //  ถ้า checkbox ที่จะเอาเส้นทางออกจาก map list เป็น uncheck
    $(chk_x).on('ifUnchecked', function () {
        var count = 0;
        var a = $('#maps_list>a');
        for (var i = 0; i < a.length; i++)
            if ($(a[i]).find('input:first').is(":checked")) {
                count++;
                break;
            }
        //  ถ้าไม่มีการเลือก checkbox ที่จะเอาเส้นทางนั้นออกจาก map list จะ set ปุ่ม remove เป็น disable
        if(!$('#btn-delete-map2').hasClass('disabled')&&count===0)
            $('#btn-delete-map2').addClass('disabled');
        var id  = $(list).find("a").index($(chk_x).parent().parent().parent())-1; //  ตำแหน่งของเส้นทางที่เราเลือกอยู่บน map list ที่เรา uncheck
        polylines_array[id].setOptions({strokeColor: "black",strokeOpacity:0.6,strokeWeight:2}); // เปลี่ยน polyline กลับเป็นสีดำเหมือนเดิม
    });
    //  กำหนด class และขนาดให้ checkbox ที่จะให้ polyline นั้น hide
    $(chk).iCheck({
        checkboxClass: 'icheckbox_minimal-blue',
        increaseArea: '10%' // optional
    });
    //  ถ้า checkbox ที่จะ hide เส้นทางนั้นเป็น check
    $(chk).on('ifChecked', function () {
        var id = $(list).find("a").index($(chk).parent().parent().parent()) - 1; //  ตำแหน่งของเส้นทางที่เราเลือกอยู่บน map list ที่เรา check
        polylines_array[id].setVisible(false); //  set ให้ polyline หายจาก map
        //  ถ้าเป็น class active ก็จะให้ mapMarker หายจาก map ด้วย
        if ($(this).parent().parent().parent().hasClass('active')) {
            for (var i = 0; i < mapMarkers.length; i++) {
                mapMarkers[i].setVisible(false);
            }
        }
    });
    //  ถ้า checkbox ที่จะ hide เส้นทางนั้นเป็น uncheck
    $(chk).on('ifUnchecked', function () {
        var id = $(list).find("a").index($(chk).parent().parent().parent()) - 1; //  ตำแหน่งของเส้นทางที่เราเลือกอยู่บน map list ที่เรา check
        polylines_array[id].setVisible(true); //  set ให้ polyline ปรากฎบน map
        //  ถ้าเป็น class active ก็จะให้ mapMarker ปรากฎบน map ด้วย
        if ($(this).parent().parent().parent().hasClass('active')) {
            for (var i = 0; i < mapMarkers.length; i++) {
                mapMarkers[i].setVisible(true);
            }
        }
    });
    //  add event ให้ a เมื่อมีการคลิก
    $(a).click(event_a);
}

/*
 *  - addEventListener_Modal_MultipleMapsTab()
 * เอาไว้ add event ให้กับปุ่มต่างๆในหน้า modal ที่เอาไว้โหลด maps จากใน database มาโชว์
 *  - ปุ่ม Load
 *  - ปุ่ม All load
 *  - ปุ่ม Close
 *  
 * @returns {undefined}
 */

// This default onbeforeunload event
//window.onbeforeunload = function(){
//    return "Are you sure to leave?"
//}
//
//$(window).unload(function(){
//
//});
google.maps.event.addDomListener(window, 'load', initialize);