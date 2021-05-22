fx_version 'cerulean'
game 'gta5'

author 'mufty'
description 'MRP Vehicle control'
version '0.0.1'

ui_page 'ui/index.html'

dependencies {
    "mrp_core"
}

files {
    'ui/images/icons/048-car-door-l-down.png',
    'ui/images/icons/048-car-door-r-down.png',
    'ui/images/icons/048-car-door-l-up.png',
    'ui/images/icons/048-car-door-r-up.png',
    'ui/config.js',
    'ui/scripts/main.js',
    'ui/styles/style.css',
    'ui/index.html',
    'client.js',
}

client_scripts {
    'client.js',
    'controls.lua',
}
