-------------------------------------------------------------------------------
Google Maps Project
-------------------------------------------------------------------------------
Version 107
Release date: 19/05/2014
-------------------------------------------------------------------------------
Project state: prototype
-------------------------------------------------------------------------------
Project description

เป็นโปรเจ็คที่ศึกษา google maps api โดยสามารถ
 - หาวิธีการหาเส้นทางที่ user ต้องการ
 - เก็บข้อมูลลงในฐานข้อมูลและสามารถเรียกมาแสดงผลได้
 - แสดงเส้นทางหลายๆเส้นพร้อมกันใน map เดียวได้

-------------------------------------------------------------------------------
API Reference : 
 Google Maps : https://developers.google.com/maps/documentation/javascript/tutorial
 Jquery : http://api.jquery.com/
 Bootflat : http://bootflat.github.io/
 X_editable : http://vitalets.github.io/x-editable/

-------------------------------------------------------------------------------
Tracking development version : 
  Google project hosting : https://code.google.com/p/google-maps-app/

-------------------------------------------------------------------------------
Installation instructions

- setup ฐานข้อมูลดังนี้ 
 -- Database : maps
  --- Table : google-maps

  --- Table-Structure export : 
        CREATE TABLE `google-maps` (
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
        ) ENGINE=MyISAM  DEFAULT CHARSET=utf8;

 --- config php.ini ดังนี้ 
        ;;;;;;;;;;;;;;;;;;;
        ; Resource Limits ;
        ;;;;;;;;;;;;;;;;;;;
        max_execution_time = 60     ; Maximum execution time of each script, in seconds
        max_input_time = 1000	; Maximum amount of time each script may spend parsing request data
        memory_limit = 24M      ; Maximum amount of memory a script may consume (8MB)

--- แก้ max_allowed_packet ใน my.ini ของ mysql สามารถแก้ได้ใน phpMyAdmin ได้ดังนี้คือ
     - ไปที่ tab Priviledges และกำหนด Global priviledge ของ localhost ให้เป็น SUPER
     - ไปที่ tab SQL แล้ว command ดังนี้
        -- SET GLOBAL max_allowed_packet=16777216; (หากไม่พอหรือมากเกินไปสามารถปรับได้ตามความเหมาะสม)
    Reason : เพราะ path ของเส้นทางบางเส้นมีขนาดใหญ่เกินขนาดของ packet ซึ่งปกติกำหนดที่ 1M (เก็บ path ได้ประมาณ 25,000 จุด)
     
-------------------------------------------------------------------------------
Additional Feature Notes

--- Shortcuts (ในทุกหน้า)
    - Z : Zoom 
    - ลูกศรซ้าย-ขวา : สลับ tabs
--- Shortcuts ในหน้า Maps
    - A/F : หาเส้นทางแบบ A-Z Route หรือ Fast Routes (Short Route) (ปุ่ม A-Z Route,Short Route)
    - S : Save ข้อมูลลงใน database
    - L : แสดง modal ในการ Load map ขึ้นมา (ปุ่ม Load)
    - R : Reset ค่าทั้งหมด (ปุ่ม Reset)
    - G : แสดงรายละเอียดเส้นทางทั้งหมด (ปุ่ม Guide)
    - 1,2,3 : เลือก Suggest Route ที่ 1,2,3 (ปุ่ม Suggest Route)

--- Shortcuts ในหน้า Multi-Routes Display
    - [,] เลื่อนการแสดงผลใน maps_list ขึ้น-ลง
    - กด H ขณะ highlight map ใน maps_list จะ toggle checkbox hide
