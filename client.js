MRP_CLIENT = null;

emit('mrp:getSharedObject', obj => MRP_CLIENT = obj);

while (MRP_CLIENT == null) {
    print('Waiting for shared object....');
}

let triggerUI = function(show) {
    let ped = PlayerPedId();
    let vehicle = GetVehiclePedIsIn(ped, false);
    if (vehicle == 0)
        return;

    let driver = GetPedInVehicleSeat(vehicle, -1); //check who's driver
    if (driver != ped) // not a driver
        return;

    let action = "show";
    let obj = {}
    if (!show) {
        action = "hide";
        SetNuiFocus(false, false);
    } else {
        SetNuiFocus(true, true);
    }

    let doorsCount = GetNumberOfVehicleDoors(vehicle);

    let doors = [];
    let hasBoot = GetIsDoorValid(vehicle, 5);
    let hasBonnet = GetIsDoorValid(vehicle, 4);
    for (let i = 0; i < doorsCount; i++) {
        //reindex
        let index = i;
        if (doorsCount == 3) { //3 door
            //less then 3 door vehicle reindex boot and bonnet
            if (i == doorsCount - 1 && hasBoot)
                index = 5; // boot
            if (i == doorsCount - 1 && hasBonnet)
                index = 4; // bonner
        } else if (doorsCount < 5) { //4 door
            //less then 4 door vehicle reindex boot and bonnet
            if (i == doorsCount - 1 && hasBoot)
                index = 5; // boot
            if (i == doorsCount - 2 && hasBonnet)
                index = 4; // bonnet
        }

        let door = {
            index: index
        };

        let angle = GetVehicleDoorAngleRatio(vehicle, index);
        door.open = (angle > 0);
        doors.push(door);
    }

    obj = {
        type: action,
        doors: doors
    };

    SendNuiMessage(JSON.stringify(obj));
}

on('mpr:vehicle:trigger', (show) => {
    triggerUI(show);
});

RegisterNuiCallbackType('close');
on('__cfx_nui:close', (data, cb) => {
    SetNuiFocus(false, false);
    triggerUI(false);
    cb();
});

RegisterNuiCallbackType('openDoors');
on('__cfx_nui:openDoors', (data, cb) => {
    let ped = PlayerPedId();
    let vehicle = GetVehiclePedIsIn(ped, false);
    if (vehicle == 0)
        return;

    if (data.open)
        SetVehicleDoorOpen(vehicle, data.doors, false, false);
    else
        SetVehicleDoorShut(vehicle, data.doors, false);

    cb();
});