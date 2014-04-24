$(function() {
    $( "#dialog" ).dialog({
      autoOpen: false,
      modal : true,
      show: {
        effect: "blind",
        duration: 1000
      },
      hide: {
        effect: "explode",
        duration: 1000
      },
      width : 700,
      height : 600,
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
  $(function() {
    $( "#selectable" ).selectable();
    $("#selectable").selectable({
        selected: function(event, ui) { 
            $(ui.selected).addClass("ui-selected").siblings().removeClass("ui-selected");
        }                   
    });
  });
  