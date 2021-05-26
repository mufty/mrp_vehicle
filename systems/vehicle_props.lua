RegisterNetEvent('mrp:vehicle:applyVehicleDamage')
AddEventHandler("mrp:vehicle:applyVehicleDamage", function(vehicle, props)
    if not DoesEntityExist(vehicle) then
        return nil
    end
    
    if props.bodyHealth then SetVehicleBodyHealth(vehicle, props.bodyHealth + 0.0) end
    if props.engineHealth then SetVehicleEngineHealth(vehicle, props.engineHealth + 0.0) end
    if props.tank then SetVehiclePetrolTankHealth(vehicle, props.tank) end

    if props.tyres then 
        for tyreId, popped in pairs(props.tyres) do
            Citizen.Wait(math.random(10,200))
            if popped == "gone" then SetVehicleTyreBurst(vehicle, tonumber(tyreId), true, 1000.0) end
            if popped == "popped" then SetVehicleTyreBurst(vehicle, tonumber(tyreId), false, 1000.0) end
        end
    end

    if props.windows then
        for windowId, enabled in pairs(props.windows) do
            Citizen.Wait(math.random(10,200))
            if enabled then SmashVehicleWindow(vehicle, tonumber(windowId)) end
        end
    end

    if props.doors then
        for doorsId, enabled in pairs(props.doors) do
            Citizen.Wait(math.random(10,200))
            if enabled then SetVehicleDoorBroken(vehicle, tonumber(doorsId), false) end
        end
    end
end)