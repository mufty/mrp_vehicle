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
    'ui/images/icons/*.png',
    'ui/sounds/*.ogg',
    'ui/config.js',
    'ui/scripts/main.js',
    'ui/styles/style.css',
    'ui/index.html',
    'config/client.json',
    'meta/*.meta',
}

data_file 'HANDLING_FILE' 'meta/handling.meta'

client_scripts {
    '@mrp_core/shared/debug.js',
    'client.js',
    'systems/*.js',
    'controls.js',
}

server_scripts {
    '@mrp_core/shared/debug.js',
    'server.js',
}