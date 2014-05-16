<html>
    <body>
        <?php

        /* 
         * To change this license header, choose License Headers in Project Properties.
         * To change this template file, choose Tools | Templates
         * and open the template in the editor.
         */
        $time_start = microtime(true); 
        $content = "";
        for($i=0;$i<30000;$i++){
            $content = $content."01234567890123456789,01234567890123456789|01234567890123456789,01234567890123456789";
        }
        $time_end = microtime(true);
        $time = $time_end - $time_start;
        echo "iteration times : "  . $time . " secs<br>";
        $sql = mysqli_connect("localhost", "root", "rabarip", "maps");
        $t1 = microtime(true);
        mysqli_query($sql,"INSERT INTO `test` (`string`) VALUES ('$content');");
        $t2 = microtime(true);
        $t = $t2-$t1;
        echo "Insert to db time : ". $t . " secs <br>";
        
        $t3 = microtime(true);
        $result = mysqli_query($sql,"SELECT * FROM `test`");
        while($row = mysqli_fetch_array($result)){
            $hi =  $row['string'];
        }
        $t4 = microtime(true);
        $tt = $t4-$t3;
        echo "Fetch time : " . $tt ." secs";
//        $fp = fopen("mytext.txt","wb");
//        fwrite($fp,$content);
//        fclose($fp);
        ?>
    </body>
</html>

