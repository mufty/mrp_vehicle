//GTAWiseGuy AWD drift
let handling = {
    fMass: 1900.000000,
    fInitialDragCoeff: 11.220000,
    fPercentSubmerged: 85.000000,
    vecCentreOfMassOffset: {
        x: 0.000000,
        y: -0.150000,
        z: 0.000000
    },
    vecInertiaMultiplier: {
        x: 1.200000,
        y: 1.200000,
        z: 1.600000
    },
    fDriveBiasFront: 0.450000,
    nInitialDriveGears: 6,
    fInitialDriveForce: 1.570000,
    fDriveInertia: 0.600000,
    fClutchChangeRateScaleUpShift: 1.600000,
    fClutchChangeRateScaleDownShift: 1.600000,
    fInitialDriveMaxFlatVel: 160.000000,
    fBrakeForce: 2.500000,
    fBrakeBiasFront: 0.500000,
    fHandBrakeForce: 6.700000,
    fSteeringLock: 50.000000,
    fTractionCurveMax: 1.200000,
    fTractionCurveMin: 1.400000,
    fTractionCurveLateral: 25.000000,
    fTractionSpringDeltaMax: 0.150000,
    fLowSpeedTractionLossMult: 0.150000,
    fCamberStiffnesss: 0.000000,
    fTractionBiasFront: 0.600000,
    fTractionLossMult: 0.600000,
    fSuspensionForce: 2.600000,
    fSuspensionCompDamp: 1.700000,
    fSuspensionReboundDamp: 2.400000,
    fSuspensionUpperLimit: 0.100000,
    fSuspensionLowerLimit: -0.160000,
    fSuspensionRaise: -0.00000,
    fSuspensionBiasFront: 0.500000,
    fAntiRollBarForce: 0.700000,
    fAntiRollBarBiasFront: 0.600000,
    fRollCentreHeightFront: 0.250000,
    fRollCentreHeightRear: 0.150000,
    fCollisionDamageMult: 0.000000,
    fWeaponDamageMult: 0.000000,
    fDeformationDamageMult: 0.000000,
    fEngineDamageMult: 0.000000,
    fPetrolTankVolume: 65.000000,
    fOilVolume: 5.000000,
    fSeatOffsetDistX: 0.000000,
    fSeatOffsetDistY: 0.000000,
    fSeatOffsetDistZ: 0.100000,
    nMonetaryValue: 150000,
    strModelFlags: 4400104,
    strHandlingFlags: 0,
    strDamageFlags: 0,
    AIHandling: 'AVERAGE'
    /*,
        SubHandlingData: {
            CCarHandlingData: {
                fBackEndPopUpCarImpulseMult: 0.100000,
                fBackEndPopUpBuildingImpulseMult: 0.030000,
                fBackEndPopUpMaxDeltaSpeed: 0.600000
            }
        }*/
}

onNet('mrp:vehicle:drift', () => {
    let ped = PlayerPedId();
    let vehicle = GetVehiclePedIsIn(ped, false);
    if (vehicle) {
        for (let field in handling) {
            SetVehicleHandlingFloat(vehicle, "CHandlingData", field, handling[field]);
        }
    }
});