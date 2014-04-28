<?php
    $filename = filter_input(INPUT_POST,'name');
    $route_type = filter_input(INPUT_POST,'route_type');
    $lanlng = $_POST['latlng'];
    $pos_value = "";
    $i=0;
    $pos_field="";
    
    date_default_timezone_set('Thailand/Bangkok');
    $date = date('Y-m-d', time());
    
//    foreach($latlng as $lalong){
//        $i++;
//        if($i === count($latlng)){
//            $pos_value = $pos_value.'\''.$lalong.'\''; 
//            $pos_field = $pos_field.'`'.'wp'.$i.'`';
//        }else{
//            $pos_value = $pos_value.'\''.$lalong.'\''.',';  
//            if($i===1){
//                $pos_field = $pos_field.'`'.'start'.'`'.',';
//            }
//            else if($i===2){
//                $pos_field = $pos_field.'`'.'end'.'`'.',';
//            }
//            else 
//                $pos_field = $pos_field.'`'.'wp'.($i-2).'`'.',';
//        }
//    }
    $sql = mysqli_connect("localhost","root","first1209","maps");
    if (mysqli_connect_errno())
    {
        echo "Failed to connect to MySQL: " . mysqli_connect_error();
    }
//    
    $result = mysqli_query($sql,"SELECT `name` FROM `google-maps` WHERE `name`='". $filename ."'");
        if(mysqli_num_rows($result)>0){
            if(mysqli_query($sql, "REPLACE INTO `google-maps` (`name`,`route_type`,`date`,`start`,`end`,`wp1`,`wp2`,`wp3`,`wp4`,`wp5`,`wp6`,`wp7`,`wp8`) VALUES ('$filename','$route_type','$date','$lanlng[0]','$lanlng[1]','$lanlng[2]','$lanlng[3]','$lanlng[4]','$lanlng[5]','$lanlng[6]','$lanlng[7]','$lanlng[8]','$lanlng[9]');")){
                echo "edit record successful";
                echo $route_type;
            }
            else{
                echo mysqli_error($sql);
            }
        }
        else{
            if(mysqli_query($sql, "INSERT INTO `google-maps` (`name`,`route_type`,`date`,`start`,`end`,`wp1`,`wp2`,`wp3`,`wp4`,`wp5`,`wp6`,`wp7`,`wp8`) VALUES ('$filename','$route_type','$date','$lanlng[0]','$lanlng[1]','$lanlng[2]','$lanlng[3]','$lanlng[4]','$lanlng[5]','$lanlng[6]','$lanlng[7]','$lanlng[8]','$lanlng[9]');"))
                echo "insert record successful";
            else{
                echo mysqli_error($sql);
            }
        }
        
//        $result = mysqli_query($sql,"SELECT `name` FROM `google-maps` WHERE `name`='". $filename ."'");
//        if(mysqli_num_rows($result)>0){
//            if(mysqli_query($sql, "REPLACE INTO `google-maps` (`name`,`route_type`,`date`,$pos_field) VALUES ('$filename','$route_type','$date',$pos_value);")){
//                echo "edit record successful";
//                echo $route_type;
//            }
//            else{
//                echo mysqli_error($sql);
//            }
//        }
//        else{
//            if(mysqli_query($sql, "INSERT INTO `google-maps` (`name`,`route_type`,`date`,$pos_field) VALUES ('$filename','$route_type','$date',$pos_value);"))
//                echo "insert record successful";
//            else{
//                echo mysqli_error($sql);
//            }
//        }
        
    mysqli_close($sql);
?>