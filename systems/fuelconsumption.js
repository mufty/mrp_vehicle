let lastFuelCheck = Date.now();
let vehicle = null;
setInterval(() => {
    let ped = PlayerPedId();
    if (!ped)
        return;

    //this to prevent vehicle despawn
    if (ped && IsPedInAnyVehicle(ped, false)) {
        if (vehicle == null) {
            //entered vehicle get fuel from server if possible
            let cv = GetVehiclePedIsIn(ped, false);
            let currentPlate = GetVehicleNumberPlateText(cv).trim();
            emitNet('mrp:vehicle:server:getFuel', currentPlate);
        }
        vehicle = GetVehiclePedIsIn(ped, false);

        //only do fuel consumption for the driver
        if (IsPedInAnyVehicle(ped, false) && vehicle && GetPedInVehicleSeat(vehicle, -1) == ped) {
            let currentFuelLevel = GetVehicleFuelLevel(vehicle);
            //turn off engine with no fuel
            if (currentFuelLevel <= 2) {
                SetVehicleEngineOn(vehicle, false, true, true);
                SetVehicleFuelLevel(vehicle, 0);
            }

            //engine off
            if (!GetIsVehicleEngineRunning(vehicle))
                return;

            let speed = GetEntitySpeed(vehicle);
            let speedKMH = speed * 3.6;
            let currentTS = Date.now();
            let drivingTimeHours = ((currentTS - lastFuelCheck) / (1000 * 60 * 60)) % 24;
            let distanceTraveled = speedKMH * drivingTimeHours;
            let vehClass = GetVehicleClass(vehicle);
            let lPer100Km = config.fuelConsumption.lPer100Km[vehClass] || config.fuelConsumption.lPer100Km[0];
            let consumptionPerKm = lPer100Km / 100;
            let consumed;
            if (distanceTraveled == 0)
                consumed = config.fuelConsumption.idleConsumption;
            else
                consumed = distanceTraveled * consumptionPerKm;

            //increase more by number of people in vehicle
            let numOfPassengers = GetVehicleNumberOfPassengers(vehicle);
            let increaseByPercentage = config.fuelConsumption.numOfPassengersIncrease * numOfPassengers;
            if (increaseByPercentage > 0)
                consumed += (consumed / 100 * increaseByPercentage);

            if (speed <= 0) {
                //idle consumption
                consumed = config.fuelConsumption.idleConsumption;
            }

            currentFuelLevel = currentFuelLevel - consumed;

            if (currentFuelLevel <= 0)
                currentFuelLevel = 0;

            SetVehicleFuelLevel(vehicle, currentFuelLevel);
            lastFuelCheck = currentTS;
        }
    } else {
        if (vehicle != null) {
            let lastDriver = GetLastPedInVehicleSeat(vehicle, -1);
            if (lastDriver != 0 && lastDriver == ped) {
                //I was a driver sync
                let currentFuel = GetVehicleFuelLevel(vehicle);
                let currentPlate = GetVehicleNumberPlateText(vehicle).trim();

                console.log(`Send fuel level to other people for [${currentPlate}] with value [${currentFuel}] reason being leaving vehicle`);
                emitNet('mrp:vehicle:server:fuelSync', GetPlayerServerId(PlayerId()), currentPlate, currentFuel);

                if (!GetIsVehicleEngineRunning(vehicle))
                    lastFuelCheck = Date.now();

                vehicle = null;
            }
        }
    }
}, 0);

onNet('mrp:vehicle:client:updateFuel', (plate, currentFuel) => {
    let ped = PlayerPedId();
    let currentVehicle = GetVehiclePedIsIn(ped, false);
    if (!currentVehicle || currentVehicle == 0)
        return;

    let currentPlate = GetVehicleNumberPlateText(currentVehicle).trim();
    if (currentPlate == plate) {
        console.log(`Got fuel data from the server updating vehicle with [${currentFuel}]`);
        SetVehicleFuelLevel(currentVehicle, currentFuel);
    }
});

onNet('mrp:vehicle:enteredVehicle', (plate, fuelCache) => {
    let ped = PlayerPedId();
    let currentVehicle = GetVehiclePedIsIn(ped, false);
    if (!currentVehicle || currentVehicle == 0)
        return;
    let currentPlate = GetVehicleNumberPlateText(currentVehicle).trim();
    let isDriving = GetPedInVehicleSeat(currentVehicle, -1) == ped;
    if (currentPlate == plate && fuelCache && isDriving) {
        console.log(`Got fuel data from the server cache updating vehicle with [${fuelCache.fuelLevel}]`);
        SetVehicleFuelLevel(currentVehicle, fuelCache.fuelLevel);
    }
});