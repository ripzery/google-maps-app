$(function () {
    var direction = $("#direction");
    var load = $("#load");
    var t = $('#t');
    var order = $('#order');

    $("#guide").click(function () {
        $(direction).modal({
            keyboard: true
        });
    });

    $('body').keyup(function (event) {
        if (event.keyCode === 27) {
            $(direction).modal('hide');
            $(load).modal('hide');
        }
    });

    $("#opener").click(function () {
        $(load).modal(); // initialized with no keyboard
        $(t).focus();
    });

    $("#doLoad").click(function () {
        Load();
        $(load).modal('hide');
    });

    $('#load').on('hidden', function () {
        $(this).data('modal', null);
    });

    $("#doClose").click(function () {
        $(order).text('Ascending');
        $(t).val("");
        $(load).modal('hide');
        resetFileName();
    });
    
    var event_arrow = function (event){
        event.preventDefault();
       if(event.keyCode === 37){//Arrow Left
           var currentTab = $('#myTab1>.active');
           var index = $('#myTab1>li').index(currentTab);
           if(index===0){
               $('#myTab1>li:last').find("a").trigger("click");
           }else if(index === 1){
               $('#myTab1>li:first').find("a").trigger("click");
           }else{
               $('#myTab1>li').eq(1).find("a").trigger("click");
           }
       }else if(event.keyCode === 39){//Arrow Right
           var currentTab = $('#myTab1>.active');
           var index = $('#myTab1>li').index(currentTab);
           if(index===0){
               $('#myTab1>li').eq(1).find("a").trigger("click");
           }else if(index === 1){
               $('#myTab1>li:last').find("a").trigger("click");
           }else{
               $('#myTab1>li:first').find("a").trigger("click");
           }
       } 
    };
    $('body').keyup(event_arrow);
});