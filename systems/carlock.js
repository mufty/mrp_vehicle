eval(LoadResourceFile('mrp_core', 'client/helpers.js'));

let dict = 'anim@mp_player_intmenu@key_fob@';
/*let dictLoaded = false;
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
waitPromise.then(() => dictLoaded = true);*/

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
            emit("mrp:lua:taskPlayAnim", ped, dict, "fob_click", 8.0, -8.0, -1, 48, 0, false, false, false);
        }
        SetVehicleLights(nearestCar.vehicle, 2);
        await utils.sleep(150);
        SetVehicleLights(nearestCar.vehicle, 0);
        await utils.sleep(150);
        SetVehicleLights(nearestCar.vehicle, 2);
        await utils.sleep(150);
        SetVehicleLights(nearestCar.vehicle, 0);
    } else if (lock == 2) {
        SetVehicleDoorsLocked(nearestCar.vehicle, 1);
        PlayVehicleDoorOpenSound(nearestCar.vehicle, 0);
        console.log(`Unlocked vehicle with plate [${plate}]`);
        if (!IsPedInAnyVehicle(ped, true)) {
            emit("mrp:lua:taskPlayAnim", ped, dict, "fob_click", 8.0, -8.0, -1, 48, 0, false, false, false);
        }
        SetVehicleLights(nearestCar.vehicle, 2);
        await utils.sleep(150);
        SetVehicleLights(nearestCar.vehicle, 0);
        await utils.sleep(150);
        SetVehicleLights(nearestCar.vehicle, 2);
        await utils.sleep(150);
        SetVehicleLights(nearestCar.vehicle, 0);
    }
};

on('mrp:vehicle:carlock', () => {
    let cycle = async () => {
        let ped = PlayerPedId();
        let nearestVehicle = await MRP_CLIENT.findNearestAccessibleVehicle(ped, config.carlock.areaSize, true);
        if (!nearestVehicle)
            return;
        lockNearestVehicle(nearestVehicle);
    };

    cycle();
});

on('mrp:lockpick', (data) => {
    let veh = exports["mrp_core"].GetClosestVehicle();
    let ped = PlayerPedId();
    if (veh && ped) {
        let [pedX, pedY, pedZ] = GetEntityCoords(ped);
        let [vehX, vehY, vehZ] = GetEntityCoords(veh);
        let distance = Vdist(pedX, pedY, pedZ, vehX, vehY, vehZ);
        if (distance <= config.carlock.lockpickDistance) {
            let lock = GetVehicleDoorLockStatus(veh);
            if (lock == 2) {
                emit('mrp:client:minigame', 'lockpick', data, 'https://mrp_vehicle/lockpick_done');
            } else {
                ClearPedSecondaryTask(ped);
                emit('chat:addMessage', {
                    template: '<div class="chat-message nonemergency">{0}</div>',
                    args: [
                        "Vehicle not locked"
                    ]
                });
            }
        } else {
            ClearPedSecondaryTask(ped);
            emit('chat:addMessage', {
                template: '<div class="chat-message nonemergency">{0}</div>',
                args: [
                    "No vehicle near"
                ]
            });
        }
    } else {
        ClearPedSecondaryTask(ped);
        emit('chat:addMessage', {
            template: '<div class="chat-message nonemergency">{0}</div>',
            args: [
                "No vehicle near"
            ]
        });
    }
});

RegisterNuiCallbackType('lockpick_done');
on('__cfx_nui:lockpick_done', (data, cb) => {
    cb({});

    let ped = PlayerPedId();
    ClearPedSecondaryTask(ped);

    if (!data.success) {
        //chance of break
        let d = data.data;
        let breakRng = utils.getRandomInt(1, d.breakChance);
        if (breakRng == 1) {
            //unluck
            emit('inventory:client:ItemBox', d, "use");
            emitNet('inventory:server:RemoveItem', d.name, 1, d.slot);
        }
    } else {
        //unlock
        let veh = exports["mrp_core"].GetClosestVehicle();
        if (!veh)
            return;

        SetVehicleDoorsLocked(veh, 1);
    }
});

RegisterCommand('carlock', () => {
    emit('mrp:vehicle:carlock');
})

RegisterKeyMapping('carlock', 'Lock/Unlock vehicle', 'keyboard', '9');
7