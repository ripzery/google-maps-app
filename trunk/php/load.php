<?php
    $query = "SELECT * 
    FROM  `google-maps`
    ORDER BY `date` ASC";
    $sql = mysqli_connect("localhost", "root", "first1209", "maps");
    $result = mysqli_query($sql, $query);
    $name = "";
    while($row = mysqli_fetch_array($result))
    {
        $name = $row['name'];
        $i = 4;
        echo $row['name'] . ":";
        echo $row['route_type']. ":";
        echo $row['date']. ":";
        while($row[$i]!=""){
            if($row[$i+1]==""){
                echo $row[$i]."|";
            }else{
                echo $row[$i].":";
            }
            $i++;
        }
    }
    mysqli_close($sql);
?>