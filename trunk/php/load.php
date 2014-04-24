<?php
    $query = "SELECT * 
    FROM  `google-maps`
    ORDER BY `date` ASC";
    $sql = mysqli_connect("localhost", "root", "rabarip", "maps");
    $result = mysqli_query($sql, $query);
    $name = "";
    while($row = mysqli_fetch_array($result))
    {
        $name = $row['name'];
        $i = 4;
        echo $row['name'] . ":";
        echo $row['route_type']. ":";
        echo $row['date']. ":";
        while($row[$i]!=NULL&&$row[$i]!=""){
            if($row[$i+1]==NULL){
                echo $row[$i]."|";
            }else{
                echo $row[$i].":";
            }
            $i++;
        }
    }
?>