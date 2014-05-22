
/*
 * ทำงานตอนโหลดหน้าเว็บเสร็จโดยเป็นการ add event ต่างๆดังนี้
 *  - กดปุ่ม Guide : แสดง modal guide
 *  - กดปุ่ม Load : แสดง modal
 *  - กดปุ่ม Load ใน modal : เรียกฟังก์ชั่น Load()
 *  - กดปุ่ม Close ใน modal : ปิด dialog
 *  - add event ปุ่มซ้ายขวา : กดเปลี่ยนtabs
 */
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
        if(map_name.length===0){
            alert("Sorry, no data in your database.");
        }
        else{
            $(load).modal(); // initialized with no keyboard
            $(t).focus();
        }
    });

    $("#doLoad").click(function () {
        Load();
        $(load).modal('hide');
    });

    $('#load').on('hidden', function () {
        $(this).data('modal', null);
    });
    
    $('#tutorial').on('click',function(){
        $('#md-tutorial').modal();
    });
    $("#doClose").click(function () {
        $(order).text('Ascending');
        $(t).val("");
        $(load).modal('hide');
        resetFileName();
    });
});