<?php
    $filename = filter_input(INPUT_POST, 'name');
    $sql = mysqli_connect("localhost","root","rabarip","maps");
    $result = mysqli_query($sql, "DELETE  FROM `google-maps`  WHERE `name` = '".$filename."'");
    if(!mysqli_fetch_array(mysqli_query($sql,"SELECT * FROM `google-maps`"))){
        mysqli_query($sql, "ALTER TABLE `table` AUTO_INCREMENT = 1");
    }
    echo $filename;
    mysqli_close($sql);
    