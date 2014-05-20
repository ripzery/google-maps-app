<?php

$test = mysqli_connect("localhost","root","rabarip");
if(!$test){
    die('Not connected : ' . mysqli_error());
}else{
    mysqli_query($test,'CREATE DATABASE IF NOT EXISTS maps;');
    mysqli_select_db($test,"maps");
    mysqli_query($test,'CREATE TABLE IF NOT EXISTS `google-maps` (
          `id` int(11) NOT NULL auto_increment,
          `name` varchar(20) NOT NULL,
          `route_type` tinyint(1) NOT NULL,
          `pick_route` int(11) NOT NULL,
          `date` date NOT NULL,
          `start` text NOT NULL,
          `end` text NOT NULL,
          `wp1` text,
          `wp2` text,
          `wp3` text,
          `wp4` text,
          `wp5` text,
          `wp6` text,
          `wp7` text,
          `wp8` text,
          `path` longtext NOT NULL,
          PRIMARY KEY  (`id`),
          UNIQUE KEY `name` (`name`)
        ) ENGINE=MyISAM  DEFAULT CHARSET=utf8;') or die(mysqli_error($test));
    mysqli_close($test);

$name = $_POST['name'];
$sql = mysqli_connect("localhost","root","rabarip","maps") or die("Unable to connect to database");

mysqli_query($sql,"SET NAMES utf8"); 
mysqli_query($sql,"SET character_set_results = utf8"); 
mysqli_query($sql,"SET character_set_connection = utf8"); 
mysqli_query($sql,"SET character_set_client = utf8"); 

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

$allowed_packet = mysqli_query($sql,'SELECT @@global.max_allowed_packet');
$max_allowed_packet = mysqli_fetch_array($allowed_packet);
if($max_allowed_packet[0]<16*1024*1024){
     mysqli_query($sql,'SET @@global.max_allowed_packet = ' . 128*1024*1024);
}

mysqli_close($sql);
}

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

