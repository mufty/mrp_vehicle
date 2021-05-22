$(document).ready(function() {
    $('.main_container').hide();

    createDoorButton = function(doorIndex) {
        let html = '<label class="rocker rocker-small" id="doorIndex_' + doorIndex + '">' +
            '<input type="checkbox">' +
            '<span class="switch-left">On</span>' +
            '<span class="switch-right">Off</span>' +
            '</label>';
        return html;
    };

    window.addEventListener('message', function(event) {
        var data = event.data;
        switch (data.type) {
            case "show":
                $('.mid').html("");
                if (data.doors && data.doors.length > 0) {
                    for (let door of data.doors) {
                        let button = createDoorButton(door.index);
                        $('.mid').append(button);
                        if (door.open)
                            $('.mid #doorIndex_' + door.index + ' input').prop("checked", true);

                        $('.mid #doorIndex_' + door.index + ' input').change(function() {
                            $.post('https://mrp_vehicle/openDoors', JSON.stringify({
                                doors: door.index,
                                open: this.checked
                            }));
                        });
                    }
                }
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