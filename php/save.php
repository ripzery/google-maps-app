<?php
    
    $filename = filter_input(INPUT_POST,'name');
    $route_type = filter_input(INPUT_POST,'route_type');
    $pick_route = filter_input(INPUT_POST,'pick_route');
    $latlng = $_POST['latlng'];
    $path = $_POST['path'];
    $pos_value = "";
    $pos_field="";
    
    date_default_timezone_set('Thailand/Bangkok');
    $date = date('Y-m-d', time());
    $sql = mysqli_connect("localhost","root","rabarip","maps");
    
    if (mysqli_connect_errno())
    {
        echo "Failed to connect to MySQL: " . mysqli_connect_error();
    }
    
    /*
     * เป็นการกำหนดค่า max_allowed_packet ในfile config mysql ซึ่งถ้าน้อยเกินไปจะไม่สามารถ save path ลง database ได้
     * ดังนั้นจึงกำหนดค่า ไปพร้อมๆกับการ save เลย 
     */
    $rs = mysqli_query($sql,'SET @@global.max_allowed_packet = ' . 128*1024*1024);
    
    /*
     * เป็นการดูว่าชื่อไฟล์ที่ส่งมาซ้ำกับใน database หรือไม่ 
     * ถ้าซ้ำจะเป็นการอัพเดตไฟล์นั้น พร้อมเปลี่ยนวันที่ให้เป็นวันที่ปัจจุบัน
     * ถ้าไม่ซ้ำจะเป็นการ insert row ใหม่ 
     */
    $result = mysqli_query($sql,"SELECT `name` FROM `google-maps` WHERE `name`='". $filename ."'");
        if(mysqli_num_rows($result)>0){
            if(mysqli_query($sql, "REPLACE INTO `google-maps` (`name`,`route_type`,`pick_route`,`date`,`start`,`end`,`wp1`,`wp2`,`wp3`,`wp4`,`wp5`,`wp6`,`wp7`,`wp8`,`path`) VALUES ('$filename','$route_type','$pick_route','$date','$latlng[0]','$latlng[1]','$latlng[2]','$latlng[3]','$latlng[4]','$latlng[5]','$latlng[6]','$latlng[7]','$latlng[8]','$latlng[9]','$path');")){
                echo "Update ". $filename ." to database successfully.";
            }
            else{
                echo mysqli_error($sql);
            }
        }
        else{
            if(mysqli_query($sql, "INSERT INTO `google-maps` (`name`,`route_type`,`pick_route`,`date`,`start`,`end`,`wp1`,`wp2`,`wp3`,`wp4`,`wp5`,`wp6`,`wp7`,`wp8`,`path`) VALUES ('$filename','$route_type','$pick_route','$date','$latlng[0]','$latlng[1]','$latlng[2]','$latlng[3]','$latlng[4]','$latlng[5]','$latlng[6]','$latlng[7]','$latlng[8]','$latlng[9]','$path');"))
                echo "Insert ". $filename ." to database successfully.";
            else{
                echo mysqli_error($sql);
            }
        }
        
    mysqli_close($sql);
?>