MRP_CLIENT = null;

emit('mrp:getSharedObject', obj => MRP_CLIENT = obj);

while (MRP_CLIENT == null) {
    print('Waiting for shared object....');
}

let show = false
RegisterCommand('vehicle', () => {
    show = !show;
    let action = "show";
    if (!show) {
        action = "hide";
        SetNuiFocus(false, false);
    } else {
        SetNuiFocus(true, true);
    }

    SendNuiMessage(JSON.stringify({
        type: action
    }));
});

RegisterKeyMapping('vehicle', 'Open vehicle menu', 'keyboard', 'RBRACKET');

RegisterNuiCallbackType('close');
on('__cfx_nui:close', (data, cb) => {
    SetNuiFocus(false, false);
    show = !show;
    cb();
});