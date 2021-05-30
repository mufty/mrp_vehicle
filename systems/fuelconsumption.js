let lastFuelCheck = Date.now();
let vehicle = null;
setInterval(() => {
    let ped = PlayerPedId();
    if (!ped)
        return;

    //this to prevent vehicle despawn
    if (ped && IsPedInAnyVehicle(ped, false)) {
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
    }
}, 0);

onNet('mrp:vehicle:leftVehicle', (currentVehicle, currentSeat) => {
    if (vehicle == currentVehicle) {
        vehicle = null;
        if (!GetIsVehicleEngineRunning(currentVehicle))
            lastFuelCheck = Date.now();
    }
});