let isPlayerInVehicle = false;
setInterval(() => {
    let ped = PlayerPedId();
    if (!ped)
        return;

    //this to prevent vehicle despawn
    if (IsPedInAnyVehicle(ped, false)) {
        if (!isPlayerInVehicle) {
            let car = GetVehiclePedIsIn(ped);
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
}, 0);