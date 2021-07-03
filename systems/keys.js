let keys = [];

MRPVehicleKeys = {
    hasKey: function(key) {
        if (!key)
            return false;

        let plate;
        if (isNaN(key)) {
            plate = key.trim();
        } else {
            plate = GetVehicleNumberPlateText(key);
        }
        if (!plate)
            return false;

        return keys.includes(plate);
    },
    giveKey: function(key) {
        if (!key)
            return;

        let plate;
        if (isNaN(key)) {
            plate = key.trim();
        } else {
            plate = GetVehicleNumberPlateText(key);
        }
        if (!plate)
            return;

        if (MRPVehicleKeys.hasKey(plate))
            return;

        console.log(`Get keys for [${plate}]`);

        keys.push(plate);
    },
    removeKey: function(key) {
        if (!key)
            return false;

        let plate;
        if (isNaN(key)) {
            plate = key.trim();
        } else {
            plate = GetVehicleNumberPlateText(key);
        }
        if (!plate)
            return false;

        if (MRPVehicleKeys.hasKey(plate)) {
            let index = keys.indexOf(plate);
            console.log(`Remove keys for [${plate}]`);
            keys.splice(index, 1);
        }
    },
    clearKeys: function() {
        keys = [];
    }
};