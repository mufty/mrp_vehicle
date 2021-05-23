MRP_CLIENT = null;

emit('mrp:getSharedObject', obj => MRP_CLIENT = obj);

while (MRP_CLIENT == null) {
    print('Waiting for shared object....');
}

let beltOn = false;
let inVehicle = false;

function isCar(veh) {
    let vc = GetVehicleClass(veh);
    return (vc >= 0 && vc <= 7) || (vc >= 9 && vc <= 12) || (vc >= 17 && vc <= 20);
}

function fwv(entity) {
    let hr = GetEntityHeading(entity) + 90.0;
    if (hr < 0.0)
        hr = 360.0 + hr;

    hr = hr * 0.0174533;
    return {
        x: Math.cos(hr) * 2.0,
        y: Math.sin(hr) * 2.0
    };
}

let speedBuffer = [];
let velBuffer = [];
setInterval(() => {
    let cycle = async function() {
        await MRP_CLIENT.sleep(0);

        let ped = PlayerPedId();
        let car = GetVehiclePedIsIn(ped);

        if (car != 0 && (inVehicle || isCar(car))) {
            inVehicle = true;
            if (beltOn) {
                DisableControlAction(0, 75, true); //Disable exit vehicle when stop
                DisableControlAction(27, 75, true); //Disable exit vehicle when Driving
            }

            speedBuffer[1] = speedBuffer[0];
            speedBuffer[0] = GetEntitySpeed(car);
            let [
                carX,
                carY,
                carZ
            ] = GetEntitySpeedVector(car, true);
            let maxSpeed = 100; //KM/H TODO config
            let speedDiff = 0.255; //original 0.255

            if (!beltOn &&
                speedBuffer[1] &&
                //carY > 0.5 &&
                carY > 1 &&
                //speedBuffer[0] > (maxSpeed / 3.6) &&
                (speedBuffer[1] - speedBuffer[0]) > (speedBuffer[0] * speedDiff)) {
                let [
                    coX,
                    coY,
                    coZ
                ] = GetEntityCoords(ped);
                let fx = fwv(ped);
                SetEntityCoords(ped, coX + fx.x, coY + fx.x, coZ - 0.47, true, true, true, false);
                SetEntityVelocity(ped, velBuffer[1].x, velBuffer[1].y, velBuffer[1].z);
                await MRP_CLIENT.sleep(1);
                SetPedToRagdoll(ped, 1000, 1000, 0, 0, 0, 0);
            }

            let [
                cvX,
                cvY,
                cvZ
            ] = GetEntityVelocity(car);
            velBuffer[1] = velBuffer[0];
            velBuffer[0] = {
                x: cvX,
                y: cvY,
                z: cvZ
            };
        } else {
            inVehicle = false;
            beltOn = false;
            speedBuffer[0] = 0;
            speedBuffer[1] = 0;
        }
    };

    cycle();
}, 0);

on('mrp:vehicle:seatbelt:trigger', () => {
    beltOn = !beltOn;
    let ped = PlayerPedId();
    let car = GetVehiclePedIsIn(ped);
    if (!car || car <= 0) {
        beltOn = false;
        return;
    }
    let sound = "seat-belt-in";
    if (!beltOn)
        sound = "seat-belt-out";
    emit('mrp:playSound', sound, 1.0); //TODO Volume adjust
    emit('mrp:vehicle:seatbelt:change', beltOn);
    let char = MRP_CLIENT.GetPlayerData();
    emit('chatMessage', char.name + " " + char.surname, [255, 255, 255], ' Seat belt: ' + (beltOn ? "ON" : "OFF") + '\n');
});

RegisterCommand('seatbelt', () => {
    emit('mrp:vehicle:seatbelt:trigger');
})

RegisterKeyMapping('seatbelt', 'Seat belt trigger', 'keyboard', 'z');