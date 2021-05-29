let dict = 'anim@mp_player_intmenu@key_fob@';
let dictLoaded = false;
RequestAnimDict(dict);

let waitPromise = new Promise((resolve) => {
    let waitForDict = () => {
        if (HasAnimDictLoaded(dict)) {
            resolve();
        } else {
            setTimeout(waitForDict, 1);
        }
    };
    waitForDict();
});
waitPromise.then(() => dictLoaded = true);

let getCarsInArea = (cars, coordsX, coordsY, coordsZ, areaSize) => {
    let result = [];
    if (!cars)
        return result;

    for (let i in cars) {
        let car = cars[i];

        let [carCoordsX, carCoordsY, carCoordsZ] = GetEntityCoords(car);
        let distance = Vdist(coordsX, coordsY, coordsZ, carCoordsX, carCoordsY, carCoordsZ);
        if (distance <= areaSize)
            result.push(car);
    }

    return result;
};

let lockNearestVehicle = async (nearestCar) => {
    if (!nearestCar || !nearestCar.distance) {
        console.log("No nearby vehicle to lock.");
        return;
    }

    let lock = GetVehicleDoorLockStatus(nearestCar.vehicle);
    let plate = GetVehicleNumberPlateText(nearestCar.vehicle);
    let ped = PlayerPedId();

    if (lock == 1 || lock == 0) {
        SetVehicleDoorShut(nearestCar.vehicle, 0, false);
        SetVehicleDoorShut(nearestCar.vehicle, 1, false);
        SetVehicleDoorShut(nearestCar.vehicle, 2, false);
        SetVehicleDoorShut(nearestCar.vehicle, 3, false);
        SetVehicleDoorsLocked(nearestCar.vehicle, 2);
        PlayVehicleDoorCloseSound(nearestCar.vehicle, 1);
        console.log(`Locked vehicle with plate [${plate}]`);
        if (!IsPedInAnyVehicle(ped, true)) {
            TaskPlayAnim(ped, dict, "fob_click_fp", 8.0, 8.0, -1, 48, 1, false, false, false)
        }
        SetVehicleLights(nearestCar.vehicle, 2);
        await MRP_CLIENT.sleep(150);
        SetVehicleLights(nearestCar.vehicle, 0);
        await MRP_CLIENT.sleep(150);
        SetVehicleLights(nearestCar.vehicle, 2);
        await MRP_CLIENT.sleep(150);
        SetVehicleLights(nearestCar.vehicle, 0);
    } else if (lock == 2) {
        SetVehicleDoorsLocked(nearestCar.vehicle, 1);
        PlayVehicleDoorOpenSound(nearestCar.vehicle, 0);
        console.log(`Unlocked vehicle with plate [${plate}]`);
        if (!IsPedInAnyVehicle(ped, true)) {
            TaskPlayAnim(ped, dict, "fob_click_fp", 8.0, 8.0, -1, 48, 1, false, false, false);
        }
        SetVehicleLights(nearestCar.vehicle, 2);
        await MRP_CLIENT.sleep(150);
        SetVehicleLights(nearestCar.vehicle, 0);
        await MRP_CLIENT.sleep(150);
        SetVehicleLights(nearestCar.vehicle, 2);
        await MRP_CLIENT.sleep(150);
        SetVehicleLights(nearestCar.vehicle, 0);
    }
};

on('mrp:vehicle:carlock', () => {
    if (!dictLoaded)
        return;
    let cycle = async () => {
        let ped = PlayerPedId();
        let [coordsX, coordsY, coordsZ] = GetEntityCoords(ped);

        let cars = exports["mrp_core"].EnumerateVehicles();
        let carsNear = getCarsInArea(cars, coordsX, coordsY, coordsZ, config.carlock.areaSize);
        if (!carsNear || carsNear.length <= 0) {
            console.log("No vehicles in the area.");
            return;
        }

        let nearestCar = {};
        for (let i in carsNear) {
            let car = carsNear[i];
            let plate = GetVehicleNumberPlateText(car);
            MRP_CLIENT.TriggerServerCallback('mrp:vehicle:carlock:hasAccess', [plate], (ownCar) => {
                //note function.apply works wierd in fivem so have to do this for now
                if (ownCar) {
                    let [coordscarX, coordscarY, coordscarZ] = GetEntityCoords(car);
                    let distance = Vdist(coordscarX, coordscarY, coordscarZ, coordsX, coordsY, coordsZ);
                    if (!nearestCar.distance) {
                        nearestCar = {
                            distance: distance,
                            vehicle: car
                        };
                    } else if (nearestCar.distance > distance) {
                        nearestCar = {
                            distance: distance,
                            vehicle: car
                        };
                    }

                    if (i == carsNear.length - 1) {
                        //lastCar try to shut doors on found car
                        lockNearestVehicle(nearestCar);
                    }
                }
            });
        }
    };

    cycle();
});

RegisterCommand('carlock', () => {
    emit('mrp:vehicle:carlock');
})

RegisterKeyMapping('carlock', 'Lock/Unlock vehicle', 'keyboard', '9');