<?php
$name = $_POST['name'];
$sql = mysqli_connect("localhost","root","rabarip","maps") or die("Unable to connect to database");
$result = mysqli_query($sql, "SELECT `name` FROM `google-maps` WHERE name = '".$name."'");
$i = 2;
$origin_name = $name;
while(mysqli_fetch_array($result)>0){
    $name = $origin_name;
    $name = $name . $i;
    $result = mysqli_query($sql, "SELECT `name` FROM `google-maps` WHERE name = '".$name."'");
    $i++;
}
echo $name;

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

