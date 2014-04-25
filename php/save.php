<?php
    $filename = $_POST['name'];
    $route_type = $_POST['route_type'];
    $latlng  = $_POST['latlng'];   
    $pos_value = "";
    $i=0;
    $pos_field="";
    
    date_default_timezone_set('Thailand/Bangkok');
    $date = date('Y-m-d', time());
    
    foreach($latlng as $lalong){
        $i++;
        if($i === count($latlng)){
            $pos_value = $pos_value.'\''.$lalong.'\''; 
            $pos_field = $pos_field.'`'.'latlng'.$i.'`';
        }else{
            $pos_value = $pos_value.'\''.$lalong.'\''.',';  
            $pos_field = $pos_field.'`'.'latlng'.$i.'`'.',';
        }
    }
    $sql = mysqli_connect("localhost","root","rabarip","maps");
    if (mysqli_connect_errno())
    {
        echo "Failed to connect to MySQL: " . mysqli_connect_error();
    }
//    
    $result = mysqli_query($sql,"SELECT `name` FROM `google-maps` WHERE `name`='". $filename ."'");
        if(mysqli_num_rows($result)>0){
            if(mysqli_query($sql, "REPLACE INTO `google-maps` (`name`,`route_type`,`date`,$pos_field) VALUES ('$filename','$route_type','$date',$pos_value);"))
                echo "edit record successful";
            else{
                echo mysqli_error($sql);
            }
        }
        else{
            if(mysqli_query($sql, "INSERT INTO `google-maps` (`name`,`route_type`,`date`,$pos_field) VALUES ('$filename','$route_type','$date',$pos_value);"))
                echo "insert record successful";
            else{
                echo mysqli_error($sql);
            }
        }
        
    mysqli_close($sql);
?>