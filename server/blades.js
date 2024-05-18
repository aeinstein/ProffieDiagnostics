const blade_definitions = JSON.parse(localStorage.blade_definitions || "{}");
const blades = JSON.parse(localStorage.blades || "{}");

function clrBlades(){
    const blade_id = getValue("blade_id");
    blades[blade_id]["blades"] = [];

    //refreshBladeIDs();
    refreshBlades();

    localStorage.setItem('blades', JSON.stringify(blades));
}

function clrBladeID(){
    const blade_id = getValue("blade_id");
    delete blades[blade_id];


    refreshBladeIDs();
    refreshBlades();

    localStorage.setItem('blades', JSON.stringify(blades));
}

function newBladeID(){
    showTemplate("tmpNewBladeID");
}

function saveNewBladeID(){
    blades[getValue("newBladeID")] = {
        presets: "presets",
        blades: [],
        save_dir: ""
    };
    localStorage.setItem('blades', JSON.stringify(blades));

    refreshBladeIDs();

    document.getElementById("blade_id").value = getValue("newBladeID");

    refreshBlades();
    hideTemplate();
}

function saveBladeDefinition(){
    const bladeName = getValue("bladeName");

    if(bladeName === "") {
        alert("You must provide a name");
        setFocus("bladeName");
        return;
    }


    switch(getValue("newBladeType")){
    case "SimpleBladePtr":
        blade_definitions[bladeName] = {
            type: "SimpleBladePtr",
            leds: getValue("numLeds"),
            data_pin: getValue("dataPin"),
            byteorder: getValue("byte_order"),
            power_pins: getSelectValues("powerpins")
        }
        break;

    case "DimBlade":
        blade_definitions[bladeName] = {
            type: "DimBlade",
            brightness: getValue("brightness"),
            blade_definition: getValue("dim_bladeDefinition")
        }

        break;

    case "SubBlade":
        let type = "SubBlade";

        let max_led = blade_definitions[getValue("sb_bladeDefinition")].leds *1;
        let first_led= getValue("sb_first") *1;
        let last_led= getValue("sb_last") *1;
        let stride = getValue("sb_stride") *1;


        console.log("stride: ", stride);

        console.log("max led: " + max_led);

        if(first_led <= 0 || first_led > max_led +1 ) {
            alert("First led must not exceed blade length");
            return;
        }

        if(last_led <= 0 || last_led > max_led +1) {
            alert("Last led must not exceed blade length");
            return;
        }

        blade_definitions[bladeName] = {
            type: type,
            first_led: first_led,
            last_led: last_led,
            blade_definition: getValue("sb_bladeDefinition")
        }

        if(first_led > last_led) {
            console.log("SubBladeReverse");
            blade_definitions[bladeName]["type"] = "SubBladeReverse";
        }

        if(stride > 1) {
            console.log("SubBladeWithStride");
            blade_definitions[bladeName]["type"] = "SubBladeWithStride";
            blade_definitions[bladeName]["stride_length"] = stride;
        }

        break;

    case "WS281XBladePtr":
        if(getValue("numLeds") < 0) {
            alert("Number of leds < 0??");
            setFocus("numLeds");
            return;
        }


        blade_definitions[bladeName] = {
            type: "WS281XBladePtr",
            leds: getValue("numLeds"),
            data_pin: getValue("dataPin"),
            byteorder: getValue("byte_order"),
            power_pins: getSelectValues("powerpins")
        }

        if(getValue("pin_class")) blade_definitions[bladeName]["pin_class"] = getValue("pin_class");
        if(getValue("frequency")) blade_definitions[bladeName]["frequency"] = getValue("frequency");
        if(getValue("reset_us")) blade_definitions[bladeName]["reset_us"] = getValue("reset_us");
        if(getValue("t1h")) blade_definitions[bladeName]["t1h"] = getValue("t1h");
        if(getValue("t0h")) blade_definitions[bladeName]["t0h"] = getValue("t0h");
        break;
    }

    localStorage.setItem('blade_definitions', JSON.stringify(blade_definitions));

    hideTemplate();
}

function buildConfig(){
    //const blade_id = getValue("blade_id");

    setValue("num_blades", getMaxBladeNumber());


    let bladeArray = "BladeConfig blades[] = {\n";

    for(const blade_id in blades) {
        stored_blade_string = "";

        console.log("writing blade: " + blade_id);
        bladeArray += "  {\n";
        bladeArray += "    " + blade_id + ",\n";

        for (let i = 0; i < blades[blade_id]["blades"].length; i++) {
            bladeArray += "    " + createBladeString(blades[blade_id]["blades"][i]) + ",\n";
        }

        bladeArray += "    CONFIGARRAY(" + blades[blade_id]["presets"] + ")\n"
        if(blades[blade_id]["save_dir"] !== "") bladeArray += "    , " + blades[blade_id]["save_dir"];
        bladeArray += "  }\n";
    }

    bladeArray += "}\n";
    document.getElementById("bladeConfig").innerHTML = bladeArray;
}



let stored_blade_string;

function createBladeString(bladeName){
    console.log("createBladeString: ", bladeName);


    const curBlade = blade_definitions[bladeName];

    let bladeString = "";
    let tmpString;

    switch(curBlade["type"]) {
        case "WS281XBladePtr":
            bladeString = curBlade["type"] + "<" + curBlade["leds"] + ", " + curBlade["data_pin"] + ", " + curBlade["byteorder"] + ", ";

            bladeString += "PowerPINS<";
            bladeString += curBlade["power_pins"]
            bladeString += "> ";

            bladeString += ">()";
            break;

        case "SubBlade":
        case "SubBladeReverse":
            tmpString = createBladeString(curBlade["blade_definition"])

            bladeString = curBlade["type"] + "(" + (curBlade["first_led"] -1) + ", " + (curBlade["last_led"] -1) + ", ";
            if(tmpString === stored_blade_string) {
                bladeString += "NULL";
            } else {
                bladeString += tmpString;
            }

            bladeString += ")";

            stored_blade_string = tmpString;
            break;

        case "SubBladeWithStride":
            tmpString = createBladeString(curBlade["blade_definition"]);

            bladeString = curBlade["type"] + "(" + (curBlade["first_led"] -1) + ", " + (curBlade["last_led"] -1) + ", ";
            bladeString += curBlade["stride_length"] + ", "
            if(tmpString === stored_blade_string) {
                bladeString += "NULL";
            } else {
                bladeString += tmpString;
            }

            bladeString += ")";

            stored_blade_string = tmpString;
            break;

        case "DimBlade":
            bladeString = curBlade["type"] + "(" + curBlade["brightness"] + ", " + createBladeString(curBlade["blade_definition"]);
            bladeString += ")";
            break;
    }

    console.log(bladeString);
    return bladeString;
}

function newBladeDefinition(){
    showTemplate("tmpNewBladeDefinition");
    showDetails();
}

function addBlade(){
    showTemplate("tmpAddBlade");

    for(const def in blade_definitions){
        console.log(def);
        addOption("bladeDefinition", def);
    }
}

function saveAddBlade(){
    const blade_id = getValue("blade_id");
    console.log("BladeID: " + blade_id);

    let bladeNo = 0;
    bladeNo += blades[blade_id]?blades[blade_id]["blades"].length:0;

    console.log("BladeNo: " + bladeNo);

    if(!blades[blade_id]) {
        blades[blade_id] = {
            preset: "presets",
            blades: [],
            save_dir: ""
        };
    }

    blades[blade_id]["blades"][bladeNo] = getValue("bladeDefinition");
    localStorage.setItem('blades', JSON.stringify(blades));

    refreshBlades();
    hideTemplate();
}

function refreshBlades(){
    const blade_id = getValue("blade_id");

    removeAllOptions("currentBlades");

    for(let i = 0; i < blades[blade_id]["blades"].length; i++){
        addOption("currentBlades", blades[blade_id]["blades"][i]);
    }

    buildConfig()
}

function getMaxBladeNumber(){
    let max_blades = 0;

    for(const blade_id in blades) {
        max_blades = (blades[blade_id]["blades"].length > max_blades)?blades[blade_id]["blades"].length:max_blades;
    }

    return max_blades;
}

function refreshBladeIDs(){
    removeAllOptions("blade_id");

    let bladeFound = false;

    for(const id in blades){
        bladeFound = true;
        addOption("blade_id", id);
    }

    if(!bladeFound) addOption("blade_id", 0);
}


function init(){
    refreshBladeIDs();
    refreshBlades();
}

window.addEventListener("load", init);
