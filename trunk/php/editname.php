<?php
$name = filter_input(INPUT_POST,'value');
$origin_name = filter_input(INPUT_POST,'origValue');
date_default_timezone_set('Thailand/Bangkok');
$date = date('Y-m-d', time());
$sql = mysqli_connect("localhost","root","rabarip","maps");
mysqli_query($sql,"SET NAMES utf8"); 
mysqli_query($sql,"SET character_set_results = utf8"); 
mysqli_query($sql,"SET character_set_connection = utf8"); 
mysqli_query($sql,"SET character_set_client = utf8"); 
$status = mysqli_query($sql, "UPDATE `google-maps` SET `name` = '".$name."' , `date` = '".$date."' WHERE `name` = '".$origin_name."'");
mysqli_close($sql);
echo $name;
