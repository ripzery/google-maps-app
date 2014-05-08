$(function() {    
    $("#guide").click(function(){
        $('#direction').modal({keyboard : false,draggable : true});
//        $('#direction').modal({ keyboard: false });
    });
     
    $( "#opener" ).click(function() {
            $('#hey').modal({keyboard : false});                      // initialized with defaults
//        $('#hey').modal({ keyboard: false });   // initialized with no keyboard
    });
    $("#doLoad").click(function(){
        Load();
        $('#hey').modal('hide');
    });
    $("#doClose").click(function(){
         resetFileName();
    });
    
    $('.alert').alert('open');
});
  