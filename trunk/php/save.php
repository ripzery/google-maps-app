<?php
    $filename = $_POST['name'];
    $command = $_POST['command'];
    $latlng  = $_POST['latlng'];   
    $pos_value = "";
    $i=0;
    $pos_field="";
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
    if(mysqli_query($sql, "INSERT INTO `google-maps` (`name`,`command`,$pos_field) VALUES ('$filename','$command',$pos_value);"))
            echo "record successful";
    else{
        echo mysqli_error($sql);
    }
    
    mysqli_close($sql);
?>