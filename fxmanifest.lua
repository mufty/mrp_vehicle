fx_version 'cerulean'
game 'gta5'

author 'mufty'
description 'MRP Vehicle control'
version '0.0.1'

ui_page 'ui/index.html'

dependencies {
    "yarn",
    "mrp_core"
}

files {
    'ui/images/icons/048-car-door-l-down.png',
    'ui/images/icons/048-car-door-r-down.png',
    'ui/images/icons/048-car-door-l-up.png',
    'ui/images/icons/048-car-door-r-up.png',
    'ui/images/icons/051-seat.png',
    'ui/images/icons/051-seat_red.png',
    'ui/sounds/seat-belt-in.ogg',
    'ui/sounds/seat-belt-out.ogg',
    'ui/config.js',
    'ui/scripts/main.js',
    'ui/styles/style.css',
    'ui/index.html',
    'config/client.json',
    'client.js',
}

client_scripts {
    'client.js',
    'systems/seatbelt.js',
    'systems/playervehicle.js',
    'systems/fuelconsumption.js',
    'systems/carlock.js',
    'systems/drift.js',
    'systems/gas_pumps.js',
    'controls.lua',
    'systems/vehicle_props.lua',
}

server_scripts {
    'server.js',
}