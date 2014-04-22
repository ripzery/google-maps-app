<?php
    $query = "SELECT * 
FROM  `google-maps` 
WHERE  `latlng1` IS NOT NULL 
AND  `latlng2` IS NOT NULL ";
    $sql = mysqli_connect("localhost", "root", "rabarip", "maps");
    $result = mysqli_query($sql, $query);
    $name = "";
    while($row = mysqli_fetch_array($result))
    {
        $name = $row['name'];
        $i = 3;
        echo $row['name'] . ":";
        echo $row['command']. ":";
        while($row[$i]!=NULL&&$row[$i]!=""){
            if($row[$i+1]==NULL){
                echo $row[$i];
            }else{
                echo $row[$i].":";
            }
            $i++;
        }
    }
?>