<?php
    $query = "SELECT * 
    FROM  `google-maps`
    ORDER BY `id` ASC";
    $sql = mysqli_connect("localhost", "root", "rabarip", "maps");
    
    /*
     * ให้สามารถโหลดชื่อภาษาไทยได้
     */
    mysqli_query($sql,"SET NAMES utf8"); 
    mysqli_query($sql,"SET character_set_results = utf8"); 
    mysqli_query($sql,"SET character_set_connection = utf8"); 
    mysqli_query($sql,"SET character_set_client = utf8"); 
    
    $result = mysqli_query($sql, $query);
    $name = "";
    while($row = mysqli_fetch_array($result))
    {
        $i = 5;
        echo $row['name'] . ":";
        echo $row['route_type']. ":";
        echo $row['pick_route'] . ":";
        echo $row['date']. ":";
        while($row[$i]!=""&&$i<16){
            if($row[$i+1]==""||$i == 15){
                echo $row[$i]."|";
            }else{
                echo $row[$i].":";
            }
            $i++;
        }
    }
    mysqli_close($sql);
?>