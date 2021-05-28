MRP_CLIENT = null;

emit('mrp:getSharedObject', obj => MRP_CLIENT = obj);

while (MRP_CLIENT == null) {
    print('Waiting for shared object....');
}

let beltOn = false;
let inVehicle = false;

function isCar(veh) {
    let vc = GetVehicleClass(veh);
    return (vc >= 0 && vc <= 7) || (vc >= 9 && vc <= 12) || (vc >= 17 && vc <= 20);
}

setInterval(() => {
    let ped = PlayerPedId();
    let car = GetVehiclePedIsIn(ped);

    if (car != 0 && (inVehicle || isCar(car))) {
        inVehicle = true;
        if (beltOn) {
            DisableControlAction(0, 75, true); //Disable exit vehicle when stop
            DisableControlAction(27, 75, true); //Disable exit vehicle when Driving
            SetPedConfigFlag(ped, 32, false); //32 = PED_FLAG_CAN_FLY_THRU_WINDSCREEN 
            return;
        }

        SetPedConfigFlag(ped, 32, true); //32 = PED_FLAG_CAN_FLY_THRU_WINDSCREEN 
        SetFlyThroughWindscreenParams(config.flyThroughWindscreen.vehMinSpeed,
            config.flyThroughWindscreen.unkMinSpeed,
            config.flyThroughWindscreen.unkModifier,
            config.flyThroughWindscreen.minDamage);
    } else {
        inVehicle = false;
        beltOn = false;
    }
}, 0);

on('mrp:vehicle:seatbelt:trigger', () => {
    beltOn = !beltOn;
    let ped = PlayerPedId();
    let car = GetVehiclePedIsIn(ped);
    if (!car || car <= 0) {
        beltOn = false;
        return;
    }
    let sound = "seat-belt-in";
    if (!beltOn)
        sound = "seat-belt-out";
    emit('mrp:playSound', sound, 1.0); //TODO Volume adjust
    emit('mrp:vehicle:seatbelt:change', beltOn);
    //let char = MRP_CLIENT.GetPlayerData();
    //emit('chatMessage', char.name + " " + char.surname, [255, 255, 255], ' Seat belt: ' + (beltOn ? "ON" : "OFF") + '\n');
});

RegisterCommand('seatbelt', () => {
    emit('mrp:vehicle:seatbelt:trigger');
})

RegisterKeyMapping('seatbelt', 'Seat belt trigger', 'keyboard', 'z');