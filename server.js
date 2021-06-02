MRP_SERVER = null;

emit('mrp:getSharedObject', obj => MRP_SERVER = obj);

while (MRP_SERVER == null) {
    print('Waiting for shared object....');
}

const ObjectId = require('mongodb').ObjectId;

onNet('mrp:vehicle:save', (source, props) => {
    exports["mrp_core"].log('server mrp:vehicle:save');
    if (!props.location)
        props.location = "OUT";

    MRP_SERVER.update('vehicle', props, () => {
        exports["mrp_core"].log('Vehicle updated!');
    }, {
        plate: props.plate
    });
});

RegisterCommand('vehLoad', (source, args, rawCommand) => {
    let id = ObjectId("60ae41eb77b7443a74b2c771");
    MRP_SERVER.read('vehicle', id, (obj) => {
        exports["mrp_core"].log(obj);
        emitNet('mrp:vehicle:applyProps', source, obj);
    });
});

on('baseevents:leftVehicle', (currentVehicle, currentSeat, vehicleDisplayName) => {
    emitNet('mrp:vehicle:leftVehicle', -1, currentVehicle, currentSeat);
});

onNet('mrp:vehicle:carlock:hasAccess', (source, plate) => {
    exports["mrp_core"].log(`checking access for vehicle plate [${plate}]`);
    //TODO check if has keys or is an owner of the vehicle
    emitNet('mrp:vehicle:carlock:hasAccess:response', source, true);
});