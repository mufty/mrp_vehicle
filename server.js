MRP_SERVER = null;

emit('mrp:getSharedObject', obj => MRP_SERVER = obj);

while (MRP_SERVER == null) {
    print('Waiting for shared object....');
}

const ObjectId = require('mongodb').ObjectId;

onNet('mrp:vehicle:save', (source, props) => {
    MRP_SERVER.create('vehicle', props, () => {
        exports["mrp_core"].log('Vehicle created!');
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