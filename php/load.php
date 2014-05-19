<?php
    $query = "SELECT * 
    FROM  `google-maps`
    ORDER BY `id` ASC";
    $sql = mysqli_connect("localhost", "root", "rabarip", "maps");
    $result = mysqli_query($sql, $query);
    $name = "";
    while($row = mysqli_fetch_array($result))
    {
        $name = $row['name'];
        $i = 5;
        echo $row['name'] . ":";
        echo $row['route_type']. ":";
        echo $row['pick_route'] . ":";
        echo $row['date']. ":";
        while($row[$i]!=""){
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