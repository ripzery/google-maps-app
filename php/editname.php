<?php
$name = filter_input(INPUT_POST,'newvalue');
$origin_name = filter_input(INPUT_POST,'origValue');
$sql = mysqli_connect("localhost","root","rabarip","maps");
mysqli_query($sql, "UPDATE `google-maps` SET `name` = '".$name."' WHERE `name` = '".$origin_name."'");
mysqli_close($sql);
echo $name;
