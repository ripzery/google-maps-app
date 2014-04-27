<?php
    $filename = filter_input(INPUT_POST, 'name');
    $sql = mysqli_connect("localhost","root","rabarip","maps");
    $result = mysqli_query($sql, "DELETE  FROM `google-maps`  WHERE `name` = '".$filename."'");
    echo $filename;
    mysqli_close($sql);
    