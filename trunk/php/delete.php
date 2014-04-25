<?php
    $filename = $_POST['name'];
    $sql = mysqli_connect("localhost","root","first1209","maps");
    mysqli_query($sql, "DELETE  FROM `google-maps`  WHERE `name` = '".$filename."'");
    mysqli_close($sql);
?>
