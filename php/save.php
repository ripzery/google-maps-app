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
    //Set max_allowed_packet
    $path_len = strlen($path);
    
    /*
     * เป็นการกำหนดค่า max_allowed_packet ในfile config mysql ซึ่งถ้าน้อยเกินไปจะไม่สามารถ save path ลง database ได้
     * ดังนั้นจึงกำหนดค่า ไปพร้อมๆกับการ save เลย โดยดูว่า max_allowed_packet ปัจจุบันมีค่ามากกว่าขนาด path ที่จะส่งอยู่แล้วหรือเปล่า
     * ถ้ามีค่ามากกว่าอยู่แล้วก็ใช้ขนาดเท่าเดิม แต่ถ้าน้อยกว่าก็จะ set ใหม่ตามขนาดของ path
     */
    $current_max_allowed_packet = mysqli_fetch_array(mysqli_query($sql,'SELECT @@global.max_allowed_packet'));
    $i = 1;
    while($path_len>$current_max_allowed_packet[0]*$i){
        $i++;
    }
    $max_allowed_packet = $current_max_allowed_packet[0]*$i;
    $rs = mysqli_query($sql,'SET @@global.max_allowed_packet = ' . $max_allowed_packet);
    
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