let isPlayerInVehicle = false;
setInterval(() => {
    let ped = PlayerPedId();
    if (!ped)
        return;

    //this to prevent vehicle despawn
    if (IsPedInAnyVehicle(ped, false)) {
        let car = GetVehiclePedIsIn(ped);
        if (!config.seatShuffleEnabled) {
            //disable seat shuffle if trying to shuffle already
            if (GetPedInVehicleSeat(car, 0) == ped && GetIsTaskActive(ped, 165)) {
                SetPedIntoVehicle(ped, car, 0);
            }
        }

        if (!isPlayerInVehicle) {
            SetEntityAsMissionEntity(car, true, false);

            if (GetPedInVehicleSeat(car, -1) == ped) {
                let engineOn = GetIsVehicleEngineRunning(car);
                SetVehicleEngineOn(car, engineOn, false, true);
            }

            //copied donno if needed
            NetworkRegisterEntityAsNetworked(car);
            SetVehicleHasBeenOwnedByPlayer(car, true);
            let id = NetworkGetNetworkIdFromEntity(car);
            SetNetworkIdCanMigrate(id, true);
            SetNetworkIdExistsOnAllMachines(id, true);
        }
        isPlayerInVehicle = true;
    } else {
        isPlayerInVehicle = false;
    }

    if (config.carlock.lockVehicles) {
        //lock spawned NPC vehicles
        let veh = GetVehiclePedIsTryingToEnter(ped);
        if (DoesEntityExist(veh) && !IsVehiclePreviouslyOwnedByPlayer(veh)) {
            let lock = GetVehicleDoorLockStatus(veh);
            if (lock == 7)
                SetVehicleDoorsLocked(veh, 2);

            let pedd = GetPedInVehicleSeat(veh, -1);
            if (pedd)
                SetPedCanBeDraggedOut(pedd, false);
        }
    }
}, 0);