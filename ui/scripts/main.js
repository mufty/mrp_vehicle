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

    createWindowButton = function(win) {
        let leftRightClass = "ctrlL";
        if (win.index % 2)
            leftRightClass = "ctrlR";
        let html = '<input type="checkbox" id="window_' + win.index + '">' +
            '<label class="' + leftRightClass + '" for="window_' + win.index + '"></label>';
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
                            let index = door.index;
                            $.post('https://mrp_vehicle/openDoors', JSON.stringify({
                                doors: index,
                                open: this.checked
                            }));
                        });
                    }
                }
                $('.windows').html("");
                if (data.windows && data.windows.length > 0) {
                    for (let win of data.windows) {
                        let winHtml = createWindowButton(win);
                        $('.windows').append(winHtml);
                        if (win.open)
                            $('.windows #window_' + win.index).prop("checked", true);

                        $('.windows #window_' + win.index).change(function() {
                            $.post('https://mrp_vehicle/toggleWindow', JSON.stringify({
                                index: win.index,
                                open: !$('#window_' + win.index).is(':checked')
                            }));
                        });
                    }
                }
                //TODO create windows buttons
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