let vehicleToFlip;
RegisterCommand("flip", () => {
    let ped = PlayerPedId();
    let nearestCar = {
        distance: 0,
        vehicle: MRP_CLIENT.getVehicleInFront()
    };

    if (nearestCar.vehicle == 0) {
        console.log("No vehicles in front.");
        return;
    }

    if (IsPedInVehicle(ped, nearestCar.vehicle, false)) {
        console.log("Get out of vehicle first!");
        emitNet('chat:addMessage', source, {
            color: [255, 255, 255],
            multiline: true,
            args: [config.locale.flip_car_getout]
        });
        return;
    }

    vehicleToFlip = nearestCar;

    FreezeEntityPosition(ped, true);
    emit("mrp:lua:taskPlayAnim", ped, config.flip.anim_dict, config.flip.anim, 1.0, -1.0, config.flip.timer, 49, 1, false, false, false);
    emit('mrp:startTimer', {
        timer: config.flip.timer,
        timerAction: 'https://mrp_vehicle/flip_done'
    });
});

RegisterNuiCallbackType('flip_done');
on('__cfx_nui:flip_done', (data, cb) => {
    cb({});

    let ped = PlayerPedId();
    if (!ped)
        return;

    FreezeEntityPosition(ped, false);
    SetVehicleOnGroundProperly(vehicleToFlip.vehicle);
    vehicleToFlip = undefined;
});