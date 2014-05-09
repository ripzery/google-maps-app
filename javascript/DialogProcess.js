$(function() {    
    $("#guide").click(function(){
        $('#direction').modal({keyboard : false,draggable : true});
//        $('#direction').modal({ keyboard: false });
    });
    
    $('body').keyup(function(event){
       if(event.keyCode === 27){
           $('#direction').modal('hide');
           $('#load').modal('hide');
       } 
    });
     
    $( "#opener" ).click(function() {
            $('#load').modal({keyboard : false});                      // initialized with defaults
//        $('#load').modal({ keyboard: false });   // initialized with no keyboard
    });
    $("#doLoad").click(function(){
        Load();
        $('#load').modal('hide');
    });
    $("#doClose").click(function(){
        $('#order').text('Ascending');
         resetFileName();
    });
});
  