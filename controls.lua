Citizen.CreateThread(function()
    local vehicleMenuOpen = false
    while true do
        Wait(0)
        local ped = PlayerPedId()
        local vehicle = GetVehiclePedIsIn(ped, false)
        if ped ~= nil and vehicle ~= 0 then
            if (IsControlPressed(0, 19) or IsDisabledControlPressed(0, 19)) and not vehicleMenuOpen then
                vehicleMenuOpen = true
                DisableControlAction(0, 19, true)
                TriggerEvent('mpr:vehicle:trigger', true)
            elseif IsControlJustReleased(0, 19) then
                vehicleMenuOpen = false
                TriggerEvent('mpr:vehicle:trigger', false)
            end
        end
    end
end)