$(document).ready(function() {
    $('#navcontainer #navlist a').on('click', function(e)  {
        var currentAttrValue = $(this).attr('href');

        // Show/Hide Tabs
        $('#navcontainer ' + currentAttrValue).show().siblings().hide();

        // Change/remove current tab to active
        $(this).parent('li').addClass('active').siblings().removeClass('active');

        e.preventDefault();
    });
});