MRP_CLIENT = null;

configFile = LoadResourceFile(GetCurrentResourceName(), 'config/client.json');

config = JSON.parse(configFile);

emit('mrp:getSharedObject', obj => MRP_CLIENT = obj);

while (MRP_CLIENT == null) {
    print('Waiting for shared object....');
}

let triggerUI = function(show) {
    let ped = PlayerPedId();
    let vehicle = GetVehiclePedIsIn(ped, false);
    if (vehicle == 0)
        return;

    let driver = GetPedInVehicleSeat(vehicle, -1);

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
    let windowCount = doorsCount;
    if (hasBoot)
        windowCount--;
    if (hasBonnet)
        windowCount--;

    let windows = [];
    let driving = false;

    if (driver == ped) { // not a driver can't do doors and windows
        driving = true;
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

        for (let i = 0; i < windowCount; i++) {
            let index = i; //+2 is because 0 and 1 is windscreen
            windows.push({
                index: index,
                open: false
            });
        }
    }

    let seats = [];
    let driverSeat = {
        index: -1,
        mySeat: false
    };
    driverSeat.empty = IsVehicleSeatFree(vehicle, driverSeat.index);

    let pedDriving = GetPedInVehicleSeat(vehicle, driverSeat.index);
    if (pedDriving == ped)
        driverSeat.mySeat = true;

    seats.push(driverSeat);
    let seatCount = GetVehicleMaxNumberOfPassengers(vehicle);
    for (let i = 0; i < seatCount; i++) {
        let seatFree = IsVehicleSeatFree(vehicle, i);
        let pedInSeat = GetPedInVehicleSeat(vehicle, i);
        let mySeat = (pedInSeat == ped);
        seats.push({
            index: i,
            empty: seatFree,
            mySeat: mySeat
        });
    }

    let engineOn = GetIsVehicleEngineRunning(vehicle);

    obj = {
        type: action,
        doors: doors,
        windows: windows,
        seats: seats,
        driving: driving,
        engineOn: engineOn
    };

    SendNuiMessage(JSON.stringify(obj));
}

on('mrp:playSound', (sound, volume) => {
    SendNuiMessage(JSON.stringify({
        type: 'playSound',
        transactionFile: sound,
        transactionVolume: volume
    }));
});

on('mpr:vehicle:trigger', (show) => {
    triggerUI(show);
});

RegisterNuiCallbackType('close');
on('__cfx_nui:close', (data, cb) => {
    SetNuiFocus(false, false);
    triggerUI(false);
    cb();
});

RegisterNuiCallbackType('toggleWindow');
on('__cfx_nui:toggleWindow', (data, cb) => {
    let ped = PlayerPedId();
    let vehicle = GetVehiclePedIsIn(ped, false);

    if (vehicle == 0)
        return;

    if (data.open)
        RollUpWindow(vehicle, data.index);
    else
        RollDownWindow(vehicle, data.index);

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

RegisterNuiCallbackType('changeSeat');
on('__cfx_nui:changeSeat', (data, cb) => {
    let ped = PlayerPedId();
    let vehicle = GetVehiclePedIsIn(ped, false);
    if (vehicle == 0)
        return;

    if (IsVehicleSeatFree(vehicle, data.index))
        SetPedIntoVehicle(ped, vehicle, data.index);

    cb();
});

RegisterNuiCallbackType('triggerEngine');
on('__cfx_nui:triggerEngine', (data, cb) => {
    let ped = PlayerPedId();
    let vehicle = GetVehiclePedIsIn(ped, false);
    SetVehicleEngineOn(vehicle, data.engineOn, false, true);
    cb();
});