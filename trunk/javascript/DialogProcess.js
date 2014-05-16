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
});