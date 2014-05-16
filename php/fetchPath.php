<?php
$name = $_POST['name'];
$count = count($name);
//$where_get_names = "`name` = '".$name[0]."' ";
//for($i=1;$i<$count;$i++){
//    $where_get_names = $where_get_names . "OR `name` = '".$name[$i]."'";
//}
$sql = mysqli_connect("localhost","root","rabarip","maps");
for($i=0;$i<$count;$i++){
    $where_get_names = "`name` = '".$name[$i]."' ";
    $result = mysqli_query($sql,"SELECT `path` FROM `google-maps` WHERE $where_get_names") or die(mysqli_error($sql));
    $row = mysqli_fetch_array($result);
    echo $row['path'].":";
}
mysqli_close($sql);