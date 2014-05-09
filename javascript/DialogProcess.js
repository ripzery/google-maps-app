$(function() {    
    $("#guide").click(function(){
        $('#direction').modal({keyboard : true});
    });
    
    $('body').keyup(function(event){
       if(event.keyCode === 27){
           $('#direction').modal('hide');
           $('#load').modal('hide');
       } 
    });
     
    $( "#opener" ).click(function() {
        $('#load').modal();   // initialized with no keyboard
    });
    
    $("#doLoad").click(function(){
        Load();
        $('#load').modal('hide');
    });
    
    $("#doClose").click(function(){
        $('#order').text('Ascending');
        $('#t').val("");
        $('#load').modal('hide');
         resetFileName();
    });
});
  