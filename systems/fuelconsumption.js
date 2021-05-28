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
            if (currentFuelLevel <= 0.8)
                SetVehicleEngineOn(car, false, true, true);

            //engine off
            if (!GetIsVehicleEngineRunning(vehicle))
                return;

            let speed = GetEntitySpeed(vehicle);
            let speedKMH = speed * 3.6;
            let currentTS = Date.now();
            let drivingTimeHours = ((currentTS - lastFuelCheck) / (1000 * 60 * 60)) % 24;
            let distanceTraveled = speedKMH * drivingTimeHours;
            let consumptionPerKm = config.fuelConsumption.lPer100Km / 100;
            let consumed = distanceTraveled * consumptionPerKm;

            //increase more by number of people in vehicle
            let numOfPassengers = GetVehicleNumberOfPassengers(vehicle);
            let increaseByPercentage = config.fuelConsumption.numOfPassengersIncrease * numOfPassengers;
            if (increaseByPercentage > 0) {
                consumed += (increaseByPercentage / consumed * 100);
            }

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