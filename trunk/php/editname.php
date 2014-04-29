<?php
$name = filter_input(INPUT_POST,'newvalue');
$origin_name = filter_input(INPUT_POST,'origValue');
date_default_timezone_set('Thailand/Bangkok');
$date = date('Y-m-d', time());
$sql = mysqli_connect("localhost","root","first1209","maps");
mysqli_query($sql, "UPDATE `google-maps` SET `name` = '".$name."' , `date` = '".$date."' WHERE `name` = '".$origin_name."'");
mysqli_close($sql);
echo $name;
