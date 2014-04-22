//function Save(){
//    var filename = prompt("Enter filename : ");
//    $.ajax({
//        type: "POST",
//        url : "../php/save.php",
//        data: ({name : filename,command : "command",latlng: points}),
//        success: function(){
//            alert("Send file to save.php successful.");
//        },
//        error: function(xhr, status, error) {
//        alert(xhr.responseText);
//       }
//    });
//}
//function Load(){
//    var return_data;
//    var name,command,points = [];
//    $.ajax({
//        url: "../php/load.php",
//        success: function(d){
//            alert("Load file successful");
//            return_data = d.split(":");
//            name = return_data[0];
//            command = return_data[1];
//            for(var i=2;i<return_data.length;i++){
//                points.push(return_data[i]);
//            }
//        }
//    });
//    
//}