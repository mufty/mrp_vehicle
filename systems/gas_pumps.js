const TANK_BONES = ["petrolcap", "petroltank", "petroltank_r", "petroltank_l", "wheel_lr"];

const REFUEL_DICT = "timetable@gardener@filling_can";
const REFUEL_ANIM = "gar_ig_5_filling_can";

function getVehicleTankPos(vehicle) {
    let bone;

    let boneIndex;
    for (let boneName of TANK_BONES) {
        boneIndex = GetEntityBoneIndexByName(vehicle, boneName);
        if (boneIndex != -1)
            break;
    }

    if (!boneIndex || boneIndex == -1) {
        //doesn't have a tank bone return vehicle possition
        let [x, y, z] = GetEntityCoords(vehicle, true);
        return {
            x: x,
            y: y,
            z: z
        };
    }

    let [x, y, z] = GetEntityBonePosition_2(vehicle, boneIndex);
    return {
        x: x,
        y: y,
        z: z
    };
}

function isVehicleNearAnyPump(vehicle) {
    let fuelTankPos = getVehicleTankPos(vehicle);
    if (!fuelTankPos)
        return false;

    for (let pump of config.gasStations.pumps) {
        let dist = Vdist(fuelTankPos.x, fuelTankPos.y, fuelTankPos.z, pump.X, pump.Y, pump.Z);
        if (dist <= config.gasStations.area) {
            return true;
        }
    }

    return false;
}

function refuel() {
    let ped = PlayerPedId();
    if (!ped)
        return;

    let vehicle = GetVehiclePedIsIn(ped, true);
    if (!vehicle)
        return;

    let currentLevel = GetVehicleFuelLevel(vehicle);
    let diff = 100 - currentLevel;
    let refuelcost = Math.ceil(diff * config.gasStations.price);
    let char = MRP_CLIENT.GetPlayerData();
    if (!char)
        return;

    if (char.stats.cash >= refuelcost) {
        //TODO add confirmation with price
        //TODO add timer to the refuel not to be instant
        SetVehicleFuelLevel(vehicle, 100);
        let currentPlate = GetVehicleNumberPlateText(vehicle).trim();
        console.log(`Send fuel level to other people for [${currentPlate}] with value [100]`);
        emitNet('mrp:vehicle:server:fuelSync', GetPlayerServerId(PlayerId()), currentPlate, 100);
        console.log(`Paid for fuel by [${char.name + " " + char.surname}] with value [${refuelcost}]`);
        emitNet('mrp:bankin:server:pay:cash', GetPlayerServerId(PlayerId()), refuelcost);
        emit("mrp:lua:taskPlayAnim", PlayerPedId(), REFUEL_DICT, REFUEL_ANIM, 8.0, 3.0, 2000, 0, 1, false, false, false);
    } else {
        console.log(`Not enough cash`);
        //TODO add info text for player
    }
}

setInterval(() => {
    let ped = PlayerPedId();
    if (!ped)
        return;

    let vehicle = GetVehiclePedIsIn(ped, true);
    if (!vehicle)
        return;

    let [x, y, z] = GetEntityCoords(ped, true);
    let tankPos = getVehicleTankPos(vehicle);
    let dist = Vdist(x, y, z, tankPos.x, tankPos.y, tankPos.z);

    //also check the position of player PED relative to the tank bone
    if (isVehicleNearAnyPump(vehicle) && dist <= config.gasStations.tankArea) {
        //near pump start logic
        emit('mrp:radial_menu:addMenuItem', {
            id: 'refuel',
            text: config.locale.refuel,
            action: 'https://mrp_vehicle/refuel'
        });
    } else {
        emit('mrp:radial_menu:removeMenuItem', {
            id: 'refuel'
        });
    }
}, 0);

RegisterNuiCallbackType('refuel');
on('__cfx_nui:refuel', (data, cb) => {
    refuel();
    cb();
});