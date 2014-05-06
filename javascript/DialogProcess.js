$(function() {    
    $( "#opener" ).click(function() {
        $('.modal').modal();                      // initialized with defaults
        $('.modal').modal({ keyboard: false });   // initialized with no keyboard
        $('#modal').modal('show');  
    });
    $("#doLoad").click(function(){
        Load();
        $('.modal').modal('hide');
    });
    $("#doClose").click(function(){
         resetFileName();
    });
});
  