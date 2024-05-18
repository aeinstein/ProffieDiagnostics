const leds = JSON.parse(localStorage.leds || "{}");

function addNewLED(){
    showTemplate("tmpNewLED");
}

function saveLed(){
    leds[getValue("LedName")] = {
        MaxAmps: getValue("MaxAmps"),
        MaxVolts: getValue("MaxVolts"),
        P2Amps: getValue("P2Amps"),
        P2Volts: getValue("P2Volts"),
        Resistor: getValue("Resistor"),
        Color: getValue("Color")
    }

    // check values

    localStorage.setItem('leds', JSON.stringify(leds));

    hideTemplate();
}

function refreshSimpleBlade(){
    for(const led in leds) {
        addOption("led1", led);
        addOption("led2", led);
        addOption("led3", led);
        addOption("led4", led);
    }
}
