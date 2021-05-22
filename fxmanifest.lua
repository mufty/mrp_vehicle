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
