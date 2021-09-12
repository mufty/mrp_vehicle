let lastHealth = -1;

setInterval(() => {
    let ped = PlayerPedId();
    if (!ped)
        return;

    let veh = GetVehiclePedIsIn(ped, false);
    if (veh == 0) {
        lastHealth = -1;
        return;
    }

    let vehHealth = GetVehicleBodyHealth(veh);

    if (lastHealth == -1) {
        lastHealth = vehHealth;
    } else if (vehHealth <= lastHealth - config.stallThreshold) {
        SetVehicleEngineOn(veh, false, false, true);

        SetNotificationTextEntry("STRING");
        AddTextComponentSubstringPlayerName("~r~" + config.locale.vehicle_stalled + "~w~");
        DrawNotification(false, false);
    }

    lastHealth = vehHealth;
}, 0);