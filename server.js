MRP_SERVER = null;

emit('mrp:getSharedObject', obj => MRP_SERVER = obj);

while (MRP_SERVER == null) {
    print('Waiting for shared object....');
}

const FUEL_CACHE = {};

const ObjectId = require('mongodb').ObjectId;

onNet('mrp:vehicle:save', (source, props) => {
    exports["mrp_core"].log('server mrp:vehicle:save');
    if (!props.location)
        props.location = "OUT";

    MRP_SERVER.update('vehicle', props, {
        plate: props.plate.trim()
    }, null, () => {
        exports["mrp_core"].log('Vehicle updated!');
        emitNet('mrp:vehicle:saved', source);
    });
});

onNet('mrp:vehicle:give', (source, props, playerId) => {
    exports["mrp_core"].log('server mrp:vehicle:give');
    if (!props.location)
        props.location = "OUT";

    let char = MRP_SERVER.getSpawnedCharacter(playerId);
    props.owner = char._id;

    MRP_SERVER.update('vehicle', props, {
        plate: props.plate.trim()
    }, null, () => {
        exports["mrp_core"].log('Vehicle updated!');
    });
});

RegisterCommand('vehLoad', (source, args, rawCommand) => {
    let id = ObjectId("60ae41eb77b7443a74b2c771");
    MRP_SERVER.read('vehicle', id, (obj) => {
        exports["mrp_core"].log(obj);
        emitNet('mrp:vehicle:applyProps', source, obj);
    });
});

RegisterCommand('giveVehicle', (source, args) => {
    let playerId = args[0];
    if (!playerId)
        return;

    emitNet('mrp:vehicle:give_vehicle', source, playerId);
}, true);

onNet('mrp:vehicle:server:getFuel', (plate) => {
    exports["mrp_core"].log(`Get fuel for [${plate}]`);
    emitNet('mrp:vehicle:enteredVehicle', -1, plate, FUEL_CACHE[plate]);
});

onNet('mrp:vehicle:server:fuelSync', (source, plate, currentFuel) => {
    FUEL_CACHE[plate] = {
        plate: plate,
        fuelLevel: currentFuel
    };
    exports["mrp_core"].log(`Sync vehicle fuel for [${plate}] with level [${currentFuel}]`);
    emitNet('mrp:vehicle:client:updateFuel', -1, plate, currentFuel);
});

onNet('mrp:vehicle:carlock:hasAccess', (source, plate, uuid) => {
    plate = plate.trim();
    exports["mrp_core"].log(`checking access for vehicle plate [${plate}] with uuid [${uuid}]`);

    let char = MRP_SERVER.getSpawnedCharacter(source);

    let query = {
        plate: plate
    };

    MRP_SERVER.read('vehicle', query, (vehicle) => {
        let isOwner = false;
        if (vehicle && MRP_SERVER.isObjectIDEqual(vehicle.owner, char._id))
            isOwner = true;

        exports["mrp_core"].log(`Player [${source}] access to [${plate}] is [${isOwner}]`);

        //TODO check key access not just owner
        emitNet('mrp:vehicle:carlock:hasAccess:response', source, {
            plate: plate,
            owner: isOwner,
            hasKeys: isOwner ? true : true
        }, uuid);
    });
});