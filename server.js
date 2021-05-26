const ObjectId = require('mongodb').ObjectId;

onNet('mrp:vehicle:save', (source, props) => {
    exports["mrp_core"].DBCreate('vehicle', props, () => {
        exports["mrp_core"].log('Vehicle created!');
    });
});

RegisterCommand('vehLoad', (source, args, rawCommand) => {
    let id = ObjectId("60ae41eb77b7443a74b2c771");
    exports["mrp_core"].DBRead('vehicle', id, (obj) => {
        exports["mrp_core"].log(obj);
        emitNet('mrp:vehicle:applyProps', source, obj);
    });
});