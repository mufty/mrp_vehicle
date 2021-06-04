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

    createSeatButton = function(seat) {
        let html = '<input type="checkbox" id="seat_' + seat.index + '">' +
            '<label class="seat" for="seat_' + seat.index + '"></label>';
        return html;
    };

    freeMySeat = function(seats) {
        for (let i in seats) {
            let seat = seats[i];
            if (seat.mySeat) {
                seat.mySeat = false;
                $('.seats #seat_' + seat.index).prop("checked", false);
                $('.seats #seat_' + seat.index).prop("disabled", false);
            }
        }
    }

    $(document).keydown(function(e) {
        //on ESC close
        if (e.keyCode == 27) {
            $('.main_container').hide();
            $.post('https://mrp_vehicle/closeUI', JSON.stringify({}));
        }
    });

    let audioPlayer = null;

    window.addEventListener('message', function(event) {
        var data = event.data;
        switch (data.type) {
            case "show":
                if (!data.driving)
                    $('.mid.engine').hide();
                else
                    $('.mid.engine').show();

                if (data.engineOn) {
                    $('.engine input').prop("checked", true);
                } else {
                    $('.engine input').prop("checked", false);
                }

                $('.engine input').change(function() {
                    $.post('https://mrp_vehicle/triggerEngine', JSON.stringify({
                        engineOn: $('.engine input').is(':checked')
                    }));
                });


                $('.mid.doors').html("");
                if (data.doors && data.doors.length > 0) {
                    for (let door of data.doors) {
                        let button = createDoorButton(door.index);
                        $('.mid.doors').append(button);
                        if (door.open)
                            $('.mid.doors #doorIndex_' + door.index + ' input').prop("checked", true);

                        $('.mid.doors #doorIndex_' + door.index + ' input').change(function() {
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
                $('.seats').html("");
                if (data.seats && data.seats.length > 0) {
                    let lastRow;
                    for (let i in data.seats) {
                        if (i % 2 == 0) {
                            lastRow = $('<div class="seatRow"></div>');
                            $('.seats').append(lastRow);
                        }
                        let seat = data.seats[i];
                        let seatHtml = createSeatButton(seat);
                        lastRow.append(seatHtml);
                        if (!seat.empty) {
                            $('.seats #seat_' + seat.index).prop("checked", true);
                            $('.seats #seat_' + seat.index).prop("disabled", true);
                        }
                        $('.seats #seat_' + seat.index).change(function() {
                            freeMySeat(data.seats);
                            seat.mySeat = true;
                            $('.seats #seat_' + seat.index).prop("checked", true);
                            $('.seats #seat_' + seat.index).prop("disabled", true);
                            $.post('https://mrp_vehicle/changeSeat', JSON.stringify(seat));
                        });
                    }
                }
                $('.main_container').show();
                break;
            case "hide":
                $('.main_container').hide();
                break;
            case "playSound":
                if (audioPlayer) {
                    audioPlayer.pause();
                }

                audioPlayer = new Howl({
                    src: ["./sounds/" + data.transactionFile + ".ogg"]
                });
                audioPlayer.volume(data.transactionVolume);
                audioPlayer.play();
                break;
            default:
                break;
        }
    })
})