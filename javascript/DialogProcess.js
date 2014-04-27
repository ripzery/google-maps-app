$(function() {
    $( "#dialog" ).dialog({
      autoOpen: false,
      modal : true,
      show: {
        //effect: "slide",
        //duration: 700,
      },
      hide: {
        //effect: "slide",
      },
      width : 700,
      height : 500,
      buttons: {
        "Load": function() {
          Load();
          $(this).dialog("close");
        },
        Cancel: function() {
          $( this ).dialog( "close" );
        }
      }
    });
 
    $( "#opener" ).click(function() {
      $( "#dialog" ).dialog( "open" );
    });
});
  