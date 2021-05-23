let isPlayerInVehicle = false;
setInterval(() => {
    let ped = PlayerPedId();
    if (!ped)
        return;

    if (IsPedInAnyVehicle(ped, false)) {
        if (!isPlayerInVehicle) {
            let car = GetVehiclePedIsIn(ped);
            SetEntityAsMissionEntity(car, true, false);
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