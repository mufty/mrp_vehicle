let vehicleMenuOpen = false;
const KEYBOARD_KEYBIND = 19
setInterval(() => {
    const ped = PlayerPedId();
    const vehicle = GetVehiclePedIsIn(ped, false);

    if (ped && vehicle != 0) {
        if (vehicleMenuOpen) {
            //disable mouse lookaround when menu's opened
            DisableControlAction(1, 1, vehicleMenuOpen);
            DisableControlAction(1, 2, vehicleMenuOpen);
            DisableControlAction(1, 4, vehicleMenuOpen);
            DisableControlAction(1, 6, vehicleMenuOpen);
        } else {
            //enable mouse lookaround when menu's opened
            EnableControlAction(1, 1, true);
            EnableControlAction(1, 2, true);
            EnableControlAction(1, 4, true);
            EnableControlAction(1, 6, true);
        }

        if (IsControlJustPressed(1, KEYBOARD_KEYBIND) && !vehicleMenuOpen) {
            vehicleMenuOpen = true;
            triggerUI(true);
        } else if (IsControlJustReleased(1, KEYBOARD_KEYBIND) && vehicleMenuOpen) {
            vehicleMenuOpen = false;
            triggerUI(false);
        }
    }
}, 0);