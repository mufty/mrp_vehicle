$(document).ready(function() {
    $('.main_container').hide();
    $(document).keyup(e => {
        if (e.key == "Escape") {
            $.post('https://mrp_vehicle/close');
            $('.main_container').hide();
        }
    });
    window.addEventListener('message', function(event) {
        var data = event.data;
        switch (data.type) {
            case "show":
                $('.main_container').show();
                break;
            case "hide":
                $('.main_container').hide();
                break;
            default:
                break;
        }
    })
})