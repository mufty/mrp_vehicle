MRP_CLIENT = null;

configFile = LoadResourceFile(GetCurrentResourceName(), 'config/client.json');
eval(LoadResourceFile('mrp_core', 'client/helpers.js'));

config = JSON.parse(configFile);

emit('mrp:getSharedObject', obj => MRP_CLIENT = obj);

while (MRP_CLIENT == null) {
    print('Waiting for shared object....');
}

getCarsInArea = (cars, coordsX, coordsY, coordsZ, areaSize) => {
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

MRP_CLIENT.findNearestAccessibleVehicle = (ped, area, checkKeys, cb) => {
    return new Promise((resolve, reject) => {
        let exec = async () => {
            let [coordsX, coordsY, coordsZ] = GetEntityCoords(ped);

            let cars = exports["mrp_core"].EnumerateVehicles();
            let carsNear = getCarsInArea(cars, coordsX, coordsY, coordsZ, area);
            if (!carsNear || carsNear.length <= 0) {
                console.log("No vehicles in the area.");
                return;
            }

            let nearestCar = {};
            for (let i in carsNear) {
                let car = carsNear[i];
                let plate = GetVehicleNumberPlateText(car);
                MRP_CLIENT.TriggerServerCallback('mrp:vehicle:carlock:hasAccess', [plate], (access) => {
                    //note function.apply works wierd in fivem so have to do this for now
                    let ownCar = access.owner;
                    if (checkKeys)
                        ownCar = access.hasKeys;

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
                    }

                    if (i == carsNear.length - 1) {
                        //lastCar in the list
                        if (cb)
                            cb(nearestCar);
                        resolve(nearestCar);
                    }
                });
            }
        };
        exec();
    });
}

MRP_CLIENT.getVehicleProperties = function(vehicle) {
    if (!DoesEntityExist(vehicle))
        return;

    let [colorPrimary, colorSecondary] = GetVehicleColours(vehicle);
    let [pearlescentColor, wheelColor] = GetVehicleExtraColours(vehicle);
    let extras = {};
    for (let extraId = 0; extraId < 13; extraId++) {
        if (DoesExtraExist(vehicle, extraId)) {
            let state = (IsVehicleExtraTurnedOn(vehicle, extraId) == 1);
            extras[extraId + ""] = state;
        }
    }

    let doorsCount = GetNumberOfVehicleDoors(vehicle);

    let doors = {};

    for (let i = 0; i < doorsCount; i++) {
        doors[i] = false;
        if (GetIsDoorValid(vehicle, i) && IsVehicleDoorDamaged(vehicle, i))
            doors[i] = true;
    }

    let windows = {};
    for (let i = 0; i < 8; i++) {
        windows[i] = false;
        if (!IsVehicleWindowIntact(vehicle, i))
            windows[i] = true;
    }

    let tyres = {};
    for (let i = 0; i < 8; i++) {
        tyres[i] = false;
        if (IsVehicleTyreBurst(vehicle, i, false))
            tyres[i] = 'popped';
        if (IsVehicleTyreBurst(vehicle, i, true))
            tyres[i] = 'gone';
    }

    return {
        model: GetEntityModel(vehicle),
        doors: doors,
        windows: windows,
        tyres: tyres,
        model: GetEntityModel(vehicle),
        tank: GetVehiclePetrolTankHealth(vehicle),
        oil: GetVehicleOilLevel(vehicle),
        drvlyt: GetIsLeftVehicleHeadlightDamaged(vehicle),
        paslyt: GetIsRightVehicleHeadlightDamaged(vehicle),
        plate: GetVehicleNumberPlateText(vehicle).trim(),
        plateIndex: GetVehicleNumberPlateTextIndex(vehicle),

        bodyHealth: Math.round(GetVehicleBodyHealth(vehicle)),
        engineHealth: Math.round(GetVehicleEngineHealth(vehicle)),

        fuelLevel: Math.round(GetVehicleFuelLevel(vehicle)),
        dirtLevel: Math.round(GetVehicleDirtLevel(vehicle)),
        color1: colorPrimary,
        color2: colorSecondary,

        pearlescentColor: pearlescentColor,
        wheelColor: wheelColor,

        wheels: GetVehicleWheelType(vehicle),
        windowTint: GetVehicleWindowTint(vehicle),
        xenonColor: GetVehicleXenonLightsColour(vehicle),

        neonEnabled: [
            IsVehicleNeonLightEnabled(vehicle, 0),
            IsVehicleNeonLightEnabled(vehicle, 1),
            IsVehicleNeonLightEnabled(vehicle, 2),
            IsVehicleNeonLightEnabled(vehicle, 3)
        ],

        neonColor: GetVehicleNeonLightsColour(vehicle),
        extras: extras,
        tyreSmokeColor: GetVehicleTyreSmokeColor(vehicle),

        modSpoilers: GetVehicleMod(vehicle, 0),
        modFrontBumper: GetVehicleMod(vehicle, 1),
        modRearBumper: GetVehicleMod(vehicle, 2),
        modSideSkirt: GetVehicleMod(vehicle, 3),
        modExhaust: GetVehicleMod(vehicle, 4),
        modFrame: GetVehicleMod(vehicle, 5),
        modGrille: GetVehicleMod(vehicle, 6),
        modHood: GetVehicleMod(vehicle, 7),
        modFender: GetVehicleMod(vehicle, 8),
        modRightFender: GetVehicleMod(vehicle, 9),
        modRoof: GetVehicleMod(vehicle, 10),

        modEngine: GetVehicleMod(vehicle, 11),
        modBrakes: GetVehicleMod(vehicle, 12),
        modTransmission: GetVehicleMod(vehicle, 13),
        modHorns: GetVehicleMod(vehicle, 14),
        modSuspension: GetVehicleMod(vehicle, 15),
        modArmor: GetVehicleMod(vehicle, 16),

        modTurbo: IsToggleModOn(vehicle, 18),
        modSmokeEnabled: IsToggleModOn(vehicle, 20),
        modXenon: IsToggleModOn(vehicle, 22),

        modFrontWheels: GetVehicleMod(vehicle, 23),
        modBackWheels: GetVehicleMod(vehicle, 24),

        modPlateHolder: GetVehicleMod(vehicle, 25),
        modVanityPlate: GetVehicleMod(vehicle, 26),
        modTrimA: GetVehicleMod(vehicle, 27),
        modOrnaments: GetVehicleMod(vehicle, 28),
        modDashboard: GetVehicleMod(vehicle, 29),
        modDial: GetVehicleMod(vehicle, 30),
        modDoorSpeaker: GetVehicleMod(vehicle, 31),
        modSeats: GetVehicleMod(vehicle, 32),
        modSteeringWheel: GetVehicleMod(vehicle, 33),
        modShifterLeavers: GetVehicleMod(vehicle, 34),
        modAPlate: GetVehicleMod(vehicle, 35),
        modSpeakers: GetVehicleMod(vehicle, 36),
        modTrunk: GetVehicleMod(vehicle, 37),
        modHydrolic: GetVehicleMod(vehicle, 38),
        modEngineBlock: GetVehicleMod(vehicle, 39),
        modAirFilter: GetVehicleMod(vehicle, 40),
        modStruts: GetVehicleMod(vehicle, 41),
        modArchCover: GetVehicleMod(vehicle, 42),
        modAerials: GetVehicleMod(vehicle, 43),
        modTrimB: GetVehicleMod(vehicle, 44),
        modTank: GetVehicleMod(vehicle, 45),
        modWindows: GetVehicleMod(vehicle, 46),
        misc48: GetVehicleMod(vehicle, 48),
        customWheelsFront: GetVehicleModVariation(vehicle, 23),
        customWheelsBack: GetVehicleModVariation(vehicle, 24),
        modLivery: GetVehicleLivery(vehicle)
    };
};

MRP_CLIENT.setVehicleProperties = function(vehicle, props) {
    if (!DoesEntityExist(vehicle))
        return;

    SetVehicleDeformationFixed(vehicle);
    SetVehicleFixed(vehicle);

    let [colorPrimary, colorSecondary] = GetVehicleColours(vehicle);
    let [pearlescentColor, wheelColor] = GetVehicleExtraColours(vehicle);

    SetVehicleModKit(vehicle, 0);

    if (props.plate)
        SetVehicleNumberPlateText(vehicle, props.plate);
    if (props.plateIndex)
        SetVehicleNumberPlateTextIndex(vehicle, props.plateIndex);
    /*if (props.bodyHealth)
        SetVehicleBodyHealth(vehicle, props.bodyHealth + 0.0);*/
    /*if (props.engineHealth)
        SetVehicleEngineHealth(vehicle, props.engineHealth + 0.0);*/
    if (props.fuelLevel)
        SetVehicleFuelLevel(vehicle, props.fuelLevel + 0.0);
    if (props.dirtLevel)
        SetVehicleDirtLevel(vehicle, props.dirtLevel + 0.0);
    if (props.color1)
        SetVehicleColours(vehicle, props.color1, colorSecondary);
    if (props.color2)
        SetVehicleColours(vehicle, props.color1 || colorPrimary, props.color2);
    if (props.pearlescentColor)
        SetVehicleExtraColours(vehicle, props.pearlescentColor, wheelColor);
    if (props.wheelColor)
        SetVehicleExtraColours(vehicle, props.pearlescentColor || pearlescentColor, props.wheelColor);
    if (props.wheels)
        SetVehicleWheelType(vehicle, props.wheels);
    if (props.windowTint)
        SetVehicleWindowTint(vehicle, props.windowTint);

    if (props.neonEnabled) {
        SetVehicleNeonLightEnabled(vehicle, 0, props.neonEnabled[0]);
        SetVehicleNeonLightEnabled(vehicle, 1, props.neonEnabled[1]);
        SetVehicleNeonLightEnabled(vehicle, 2, props.neonEnabled[2]);
        SetVehicleNeonLightEnabled(vehicle, 3, props.neonEnabled[3]);
    }

    if (props.extras) {
        for (let extraId in props.extras) {
            if (props.extras[extraId])
                SetVehicleExtra(vehicle, parseInt(extraId), 0);
            else
                SetVehicleExtra(vehicle, parseInt(extraId), 1);
        }
    }

    if (props.neonColor)
        SetVehicleNeonLightsColour(vehicle, props.neonColor[0], props.neonColor[1], props.neonColor[2]);
    if (!isNaN(props.xenonColor))
        SetVehicleXenonLightsColour(vehicle, props.xenonColor);
    if (props.modSmokeEnabled)
        ToggleVehicleMod(vehicle, 20, true);
    if (props.tyreSmokeColor)
        SetVehicleTyreSmokeColor(vehicle, props.tyreSmokeColor[0], props.tyreSmokeColor[1], props.tyreSmokeColor[2]);
    if (!isNaN(props.modSpoilers))
        SetVehicleMod(vehicle, 0, props.modSpoilers, false);
    if (!isNaN(props.modFrontBumper))
        SetVehicleMod(vehicle, 1, props.modFrontBumper, false);
    if (!isNaN(props.modRearBumper))
        SetVehicleMod(vehicle, 2, props.modRearBumper, false);
    if (!isNaN(props.modSideSkirt))
        SetVehicleMod(vehicle, 3, props.modSideSkirt, false);
    if (!isNaN(props.modExhaust))
        SetVehicleMod(vehicle, 4, props.modExhaust, false);
    if (!isNaN(props.modFrame))
        SetVehicleMod(vehicle, 5, props.modFrame, false);
    if (!isNaN(props.modGrille))
        SetVehicleMod(vehicle, 6, props.modGrille, false);
    if (!isNaN(props.modHood))
        SetVehicleMod(vehicle, 7, props.modHood, false);
    if (!isNaN(props.modFender))
        SetVehicleMod(vehicle, 8, props.modFender, false);
    if (!isNaN(props.modRightFender))
        SetVehicleMod(vehicle, 9, props.modRightFender, false);
    if (!isNaN(props.modRoof))
        SetVehicleMod(vehicle, 10, props.modRoof, false);
    if (!isNaN(props.modEngine))
        SetVehicleMod(vehicle, 11, props.modEngine, false);
    if (!isNaN(props.modBrakes))
        SetVehicleMod(vehicle, 12, props.modBrakes, false);
    if (!isNaN(props.modTransmission))
        SetVehicleMod(vehicle, 13, props.modTransmission, false);
    if (!isNaN(props.modHorns))
        SetVehicleMod(vehicle, 14, props.modHorns, false);
    if (!isNaN(props.modSuspension))
        SetVehicleMod(vehicle, 15, props.modSuspension, false);
    if (!isNaN(props.modArmor))
        SetVehicleMod(vehicle, 16, props.modArmor, false);
    if (!isNaN(props.modTurbo))
        ToggleVehicleMod(vehicle, 18, props.modTurbo);
    if (!isNaN(props.modXenon))
        ToggleVehicleMod(vehicle, 22, props.modXenon);
    if (!isNaN(props.modFrontWheels))
        SetVehicleMod(vehicle, 23, props.modFrontWheels, false);
    if (!isNaN(props.modBackWheels))
        SetVehicleMod(vehicle, 24, props.modBackWheels, false);
    if (!isNaN(props.modPlateHolder))
        SetVehicleMod(vehicle, 25, props.modPlateHolder, false);
    if (!isNaN(props.modVanityPlate))
        SetVehicleMod(vehicle, 26, props.modVanityPlate, false);
    if (!isNaN(props.modTrimA))
        SetVehicleMod(vehicle, 27, props.modTrimA, false);
    if (!isNaN(props.modOrnaments))
        SetVehicleMod(vehicle, 28, props.modOrnaments, false);
    if (!isNaN(props.modDashboard))
        SetVehicleMod(vehicle, 29, props.modDashboard, false);
    if (!isNaN(props.modDial))
        SetVehicleMod(vehicle, 30, props.modDial, false);
    if (!isNaN(props.modDoorSpeaker))
        SetVehicleMod(vehicle, 31, props.modDoorSpeaker, false);
    if (!isNaN(props.modSeats))
        SetVehicleMod(vehicle, 32, props.modSeats, false);
    if (!isNaN(props.modSteeringWheel))
        SetVehicleMod(vehicle, 33, props.modSteeringWheel, false);
    if (!isNaN(props.modShifterLeavers))
        SetVehicleMod(vehicle, 34, props.modShifterLeavers, false);
    if (!isNaN(props.modAPlate))
        SetVehicleMod(vehicle, 35, props.modAPlate, false);
    if (!isNaN(props.modSpeakers))
        SetVehicleMod(vehicle, 36, props.modSpeakers, false);
    if (!isNaN(props.modTrunk))
        SetVehicleMod(vehicle, 37, props.modTrunk, false);
    if (!isNaN(props.modHydrolic))
        SetVehicleMod(vehicle, 38, props.modHydrolic, false);
    if (!isNaN(props.modEngineBlock))
        SetVehicleMod(vehicle, 39, props.modEngineBlock, false);
    if (!isNaN(props.modAirFilter))
        SetVehicleMod(vehicle, 40, props.modAirFilter, false);
    if (!isNaN(props.modStruts))
        SetVehicleMod(vehicle, 41, props.modStruts, false);
    if (!isNaN(props.modArchCover))
        SetVehicleMod(vehicle, 42, props.modArchCover, false);
    if (!isNaN(props.modAerials))
        SetVehicleMod(vehicle, 43, props.modAerials, false);
    if (!isNaN(props.modTrimB))
        SetVehicleMod(vehicle, 44, props.modTrimB, false);
    if (!isNaN(props.modTank))
        SetVehicleMod(vehicle, 45, props.modTank, false);
    if (!isNaN(props.modWindows))
        SetVehicleMod(vehicle, 46, props.modWindows, false);

    if (!isNaN(props.misc48)) {
        SetVehicleMod(vehicle, 48, props.misc48, false);
        SetVehicleLivery(vehicle, props.misc48);
    }

    if (!isNaN(props.modLivery) && props.modLivery != -1) {
        SetVehicleMod(vehicle, 48, props.modLivery, false);
        SetVehicleLivery(vehicle, props.modLivery);
    }

    if (props.customWheelsFront) {
        SetVehicleMod(vehicle, 23, GetVehicleMod(vehicle, 23), props.customWheelsFront);
    }

    if (props.customWheelsBack) {
        SetVehicleMod(vehicle, 24, GetVehicleMod(vehicle, 24), props.customWheelsBack);
    }

    //TODO: drvlyt: GetIsLeftVehicleHeadlightDamaged(veh)
    //TODO: paslyt: GetIsRightVehicleHeadlightDamaged(veh)

    /*if (props.tank)
        SetVehiclePetrolTankHealth(vehicle, props.tank);*/
    if (props.oil)
        SetVehicleOilLevel(vehicle, props.oil);
};

function triggerUI(show) {
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
        SetNuiFocusKeepInput(false);
    } else {
        SetNuiFocus(true, true);
        SetNuiFocusKeepInput(true);
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
    cb({});
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

    cb({});
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

    cb({});
});

RegisterNuiCallbackType('changeSeat');
on('__cfx_nui:changeSeat', (data, cb) => {
    let ped = PlayerPedId();
    let vehicle = GetVehiclePedIsIn(ped, false);
    if (vehicle == 0)
        return;

    //data check if ped was a driver and if so sync fuel
    let currentDriver = GetPedInVehicleSeat(vehicle, -1);
    let currentFuel = GetVehicleFuelLevel(vehicle);
    let currentPlate = GetVehicleNumberPlateText(vehicle).trim();
    if (currentDriver != 0 && currentDriver == ped) {
        //I was a driver sync
        console.log(`Send fuel level to other people for [${currentPlate}] with value [${currentFuel}]`);
        emitNet('mrp:vehicle:server:fuelSync', GetPlayerServerId(PlayerId()), currentPlate, currentFuel);
    }

    if (IsVehicleSeatFree(vehicle, data.index)) {
        if (data.index == -1)
            emitNet('mrp:vehicle:server:getFuel', currentPlate);
        SetPedIntoVehicle(ped, vehicle, data.index);
    }

    cb({});
});

RegisterNuiCallbackType('give_keys');
on('__cfx_nui:give_keys', (data, cb) => {
    cb({});

    let ped = PlayerPedId();
    let vehicle = GetVehiclePedIsIn(ped, false);
    if (vehicle == 0) {
        vehicle = MRP_CLIENT.getVehicleInFront();
    }

    if (vehicle == 0) {
        emit('chat:addMessage', {
            template: '<div class="chat-message nonemergency">{0}</div>',
            args: [
                config.locale.no_vehicle_near
            ]
        });
        return;
    }

    if (MRPVehicleKeys.hasKey(vehicle)) {
        //get all players in vehicle
        let players = utils.getAllPlayersInVehicle(vehicle);
        let plate = GetVehicleNumberPlateText(vehicle);
        emitNet('mrp:vehicle:server:giveKeys', players, plate);
    } else {
        emit('chat:addMessage', {
            template: '<div class="chat-message nonemergency">{0}</div>',
            args: [
                config.locale.no_vehicle_keys
            ]
        });
    }
});

RegisterNuiCallbackType('triggerEngine');
on('__cfx_nui:triggerEngine', (data, cb) => {
    let ped = PlayerPedId();
    let vehicle = GetVehiclePedIsIn(ped, false);

    //only driver can handle engine
    if (GetPedInVehicleSeat(vehicle, -1) == ped) {
        if (MRPVehicleKeys.hasKey(vehicle))
            SetVehicleEngineOn(vehicle, data.engineOn, false, true);
        else {
            let plate = GetVehicleNumberPlateText(vehicle);
            console.log(`You don't have keys for vehicle [${plate}]`);
        }
    }
    cb({});
});

RegisterNuiCallbackType('closeUI');
on('__cfx_nui:closeUI', (data, cb) => {
    SetNuiFocus(false, false);
    cb({});
});

onNet('mrp:vehicle:save:owned', function() {
    console.log('try to save owned vehicle');
    let ped = PlayerPedId();
    let vehicle = GetVehiclePedIsIn(ped, false);
    if (vehicle == 0)
        return;

    let plate = GetVehicleNumberPlateText(vehicle);
    MRP_CLIENT.TriggerServerCallback('mrp:vehicle:carlock:hasAccess', [plate], (access) => {
        let ownCar = access.owner;
        if (!ownCar)
            return;

        let props = MRP_CLIENT.getVehicleProperties(vehicle);
        emitNet('mrp:vehicle:save', GetPlayerServerId(PlayerId()), props);
    });
});

onNet('mrp:vehicle:applyProps', (props) => {
    let ped = PlayerPedId();
    let vehicle = GetVehiclePedIsIn(ped, false);
    if (vehicle == 0)
        return;

    MRP_CLIENT.setVehicleProperties(vehicle, props);
    emit('mrp:vehicle:applyVehicleDamage', vehicle, props);
});

on('mrp:vehicle:getSharedObject', (cb) => {
    cb(MRP_CLIENT);
});

onNet('mrp:vehicle:give_vehicle', (playerId) => {
    let ped = PlayerPedId();
    let vehicle = GetVehiclePedIsIn(ped, false);
    if (!vehicle)
        return;

    if (!playerId)
        return;

    let vehicleProperties = MRP_CLIENT.getVehicleProperties(vehicle);
    emitNet('mrp:vehicle:give', GetPlayerServerId(PlayerId()), vehicleProperties, playerId);
});

onNet('mrp:vehicle:client:giveKeys', (plates) => {
    for (let plate of plates) {
        console.log(`Give player a key for vehicle [${plate}]`);
        MRPVehicleKeys.giveKey(plate);
    }
});