const leds = JSON.parse(sessionStorage.leds || "{}");
const blades = JSON.parse(sessionStorage.blades || "[]");

let current_template;
let current_details;

function addNewLED(){
    showTemplate("tmpNewLED");
}

function addBlade(){
    showTemplate("tmpNewBlade");
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

    sessionStorage.setItem('leds', JSON.stringify(leds));

    hideTemplate();
}

function saveBlade(){
    const noBlade = blades.length;

    blades[noBlade] = {
        type: "WS281XBladePtr",
        leds: getValue("numLeds"),
        data_pin: getValue("dataPin"),
        byteorder: getValue("byte_order"),
        power_pins: getValue("powerpins")
    }

    if(getValue("pin_class")) blades[noBlade]["pin_class"] = getValue("pin_class");
    if(getValue("frequency")) blades[noBlade]["frequency"] = getValue("frequency");
    if(getValue("reset_us")) blades[noBlade]["reset_us"] = getValue("reset_us");
    if(getValue("t1h")) blades[noBlade]["t1h"] = getValue("t1h");
    if(getValue("t0h")) blades[noBlade]["t0h"] = getValue("t0h");

    sessionStorage.setItem('blades', JSON.stringify(blades));

    hideTemplate();
}

function showDetails(evt){
    console.log(evt);
    let tmp;

    if(current_details) current_details.style.display = "none";

    switch(evt.target.value){
        case "SimpleBladePtr":
            tmp = document.getElementById("detailsSimpleBlade");
            refreshSimpleBlade();
            break;

        case "WS281XBladePtr":
            tmp = document.getElementById("detailsWS281XBladePtr");
            break;
    }

    tmp.style.display = "inline-block";
    current_details = tmp;
}

function showTemplate(id){
    if(current_template) document.body.removeChild(current_template);

    const template = document.getElementById(id);

    const container = document.createElement("DIV");
    container.innerHTML = template.innerHTML;
    container.className = "modal";
    document.body.appendChild(container);

    current_template = container;
}

function hideTemplate(){
    if(current_template) document.body.removeChild(current_template);
    current_template = null;
}

function getValue(id){
    const tmp = document.getElementById(id);
    if(tmp) return tmp.value;
    return false;
}

function refreshSimpleBlade(){
    for(const led in leds) {
        addOption("led1", led);
        addOption("led2", led);
        addOption("led3", led);
        addOption("led4", led);
    }
}

function addOption(selectBox, option){
    console.log("adding: " + option);
    const sb = document.getElementById(selectBox);

    const opt = document.createElement("OPTION");
    opt.value = option;
    opt.text = option;
    sb.add(opt);
}
