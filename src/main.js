//Globals
let setDefaults = true,
    parameterList;
    enableWindows.checked = true,
    isWindows = true,
    darkMode = true;
//themeSwitcher.setAttribute("style", "filter: invert(100%)"); //Icon is black
function update() {
    let command = "",
        isOutputValid = 0;
    //Set base path dependent on platform
    if (enableWindows.checked) {
        isWindows = true;
        baseDirectory = "c:\\mirrorTool\\";
    } else {
        baseDirectory = "/tmp/mirrorTool/";
        isWindows = false;
    }
    if (setDefaults) {
        enableMirror.checked = true;
        enableRepository.checked = false;
        enableGlobal.checked = false;
        enableOptional.checked = false;
        //Master list of parameters
        //KEY: 0=name of parameter, 1=default value, 2=type of element, 3=section name, 4=optional
        parameterList = [
            ["mirrorType", "regular", "select", "mirror", false],
            ["intermediateUpdateDirectory", baseDirectory + "mirrorTemp", "text", "mirror", false],
            ["offlineLicenseFilename", baseDirectory + "offline.lf", "text", "mirror", false],
            ["updateServer", "", "text", "mirror", true],
            ["outputDirectory", baseDirectory + "mirror", "text", "mirror", false],
            ["proxyHost", "", "text", "global", true],
            ["proxyPort", "", "text", "global", true],
            ["proxyUsername", "", "text", "global", true],
            ["proxyPassword", "", "text", "global", true],
            ["networkDriveUsername", "", "text", "mirror", true],
            ["networkDrivePassword", "", "text", "mirror", true],
            ["excludedProducts", "none", "select", "mirror", true],
            ["repositoryServer", "AUTOSELECT", "text", "repository", false],
            ["intermediateRepositoryDirectory", baseDirectory + "repositoryTemp", "text", "repository", false],
            ["mirrorOnlyLevelUpdates", false, "checkbox", "mirror", true],
            ["outputRepositoryDirectory", baseDirectory + "repository", "text", "repository", false],
            ["mirrorFileFormat", "none", "select", "mirror", true],
            ["compatibilityVersion", "", "text", "mirror", true],
            ["filterFilePath", "", "text", "repository", true],
            ["trustDownloadedFilesInRepositoryTemp", false, "checkbox", "repository", true]
        ];
    }
    for (let i = 0; i < parameterList.length; i++) {
        //Aliases
        let pName = parameterList[i][0],
            pElement = document.getElementById(pName),
            pDefault = parameterList[i][1],
            pType = parameterList[i][2],
            pSection = parameterList[i][3],
            pOptional = parameterList[i][4];
        if (setDefaults) {
            pElement.value = pDefault;
            pElement.checked = pDefault;
        }
        let o = document.getElementsByClassName("optional");
        //Iterate through optional parameters, hide them if enableoptional is not checked
        for (let i = 0; i < o.length; i++) {
            enableOptional.checked ? o[i].style.display = "block" : o[i].style.display = "none";
        }
        //Iterate through all the parameters
        if (pElement != null) {
            //Check if section is enabled, if so allow the mandatory parameters to be written to the output
            if ((enableMirror.checked && pSection == "mirror") || (enableRepository.checked && pSection == "repository") || (enableGlobal.checked && pSection == "global")) {
                //Check if either optional parameters are enabled or optional parameters are disabled and current parameter is mandatory
                if (enableOptional.checked || !enableOptional.checked && parameterList[i][4] == false) {
                    switch (pType) {
                        case ("text"):
                            //Write parameter and args for text box
                            if (pElement.value != "") command += "<colorParameter>--" + pName + "</colorParameter> <colorArgument>" + pElement.value + "</colorArgument> ";
                            break;
                        case ("checkbox"):
                            //Write parameter for checkbox
                            if (pElement.checked) command += "<colorParameter>--" + pName + "</colorParameter> ";
                            break;
                        case ("select"):
                            //Write parameter for currently selected item in dropdown box and args
                            if (pElement.options[pElement.selectedIndex].text != "none") command += "<colorParameter>--" + pName + "</colorParameter> <colorArgument>" + pElement.options[pElement.selectedIndex].value + "</colorArgument> ";
                            break;
                    }
                }
            }
        }
        //If field is empty and mandatory then highlight the field red, modify the placeholder text, and declare the output as invalid
        if (pElement.value == "" && !pOptional) {
            pElement.style.borderColor = "rgb(194, 71, 71)";
            pElement.placeholder = "This field cannot be blank";
            isOutputValid++
        } else {
            pElement.style.borderColor = "rgb(63, 63, 63)";
        }
    }
    //If the number of invalid fields are more than 0 or mandatory sections are disabled the disable the copy and download buttons, otherwise show them
    if (isOutputValid > 0 || (!enableMirror.checked && !enableRepository.checked)) {
        copyButton.disabled = true;
        downloadButton.disabled = true;
        commandPreview.disabled = true;
    } else {
        copyButton.disabled = false;
        downloadButton.disabled = false;
        commandPreview.disabled = false;
    }
    //Trim whitespace
    command = command.trim();
    //Check if there is anything to write and if the output is valid, if so write the platform specific prefix plus the commands to the command preview
    if (command.length != 0 && isOutputValid == 0) {
        enableWindows.checked ? commandPreview.innerHTML = "<colorStart>MirrorTool.exe</colorStart> " + command : commandPreview.innerHTML = "<colorStart>sudo ./MirrorTool</colorStart> " + command
    } else commandPreview.innerHTML = "<colorWarn>Some parameter sections are not enabled, or mandatory fields are empty. Check your configuration.</colorWarn>";
    //Show or hide sections based on checkbox states
    enableMirror.checked ? mirror.style.display = "block" : mirror.style.display = "none";
    enableRepository.checked ? repository.style.display = "block" : repository.style.display = "none";
    enableGlobal.checked ? global.style.display = "block" : global.style.display = "none";
    setDefaults = false;
}
update();
expand1.addEventListener("click", function() {
    expandSection1.hidden = true;
});
expand2.addEventListener("click", function() {
    expandSection2.hidden = true;
});
//Main form event listener to update the command preview
main.addEventListener("input", function () { update(); });
//Event listeners for reset query
resetLink.addEventListener("click", function () { resetQuestion() });
enableWindows.addEventListener("click", function () { isWindows ? null : resetQuestion() });
enableLinux.addEventListener("click", function () { isWindows ? resetQuestion() : null });
//Download event listener
downloadButton.addEventListener("click", function (event) {
    if (enableWindows.checked) {
        download('test.bat', commandPreview.textContent);
    } else {
        let command = commandPreview.textContent;
        command = command.split("sudo ").pop();
        download('test.sh', command);
    }
});
//Scroll to bottom when section expands to ensure visibility
enableMirror.addEventListener("input", function () { update(); scrollToBottom() });
enableRepository.addEventListener("input", function () { update(); scrollToBottom() });
enableOptional.addEventListener("input", function () { update(); scrollToBottom() });
enableGlobal.addEventListener("input", function () { update(); scrollToBottom() });
//Theme switcher event listener
/*themeSwitcher.addEventListener("click", function() {
    darkMode ? darkMode = false : darkMode = true;
    update();
});*/
//Disable F5
document.addEventListener('keydown', (e) => {
    e = e || window.event;
    if (e.keyCode == 116) {
        //e.preventDefault();
    }
});
function scrollToBottom() {
    //window.scrollTo(0,document.body.scrollHeight);
}
function resetQuestion() {
    setDefaults = confirm("Reset all settings and filters?");
    update();
}
//Read in products.csv (obtained by running MirrorTool with --dryRun parameter) and split it by each new line/carraige return
temp = readTextFile("https://raw.githubusercontent.com/esetuk/jsonbuilder/master/products.csv").split(/[\r\n]+/),
    products = [],
    //Main nodes (exclude path as this is not required)
    nodes = ["app_id", "name", "version", "languages", "os_types", "platforms", "legacy"];
//Iterate through each line
for (i = 0; i < temp.length; i++) {
    //Split the lines by comma seperator and remove the path
    temp[i] = temp[i].split(",").slice(0, -1)
    for (j = 0; j < temp[i].length; j++) {
        //Trim whitespace and add the element into the array
        temp[i][j] = temp[i][j].trim();
    }
    //Push each array into a parent array
    products.push(temp[i]);
}
//Add event listeners to each select (nodes)
for (let i = 0; i < nodes.length; i++) {
    document.getElementById(nodes[i]).addEventListener("change", function () { document.getElementById("enable" + nodes[i]).checked = true; jbUpdate(); }); //Enable the filter if a selection is made
    //Add event listener to filter checkbox
    document.getElementById("enable" + nodes[i]).addEventListener("click", function () { jbUpdate(); });
}
//Event listener for select none - clear all filters
clearFilters.addEventListener("click", function () {
    for (let i = 0; i < nodes.length; i++) {
        document.getElementById("enable" + nodes[i]).checked = false;
    }
    jbUpdate();
});
//Event listener for select all filters
selectAll.addEventListener("click", function () {
    for (let i = 0; i < nodes.length; i++) {
        document.getElementById("enable" + nodes[i]).checked = true;
    }
    jbUpdate();
});
//Add an event listener for the form
main.addEventListener("change", function () { jbUpdate(); });
//Add an event listener for add product
addProduct.addEventListener("click", function () {
    //Check if anything is selected, otherwise do nothing
    if (isAnythingSelected()) {
        //Get the rows and columns count
        let columnCount = nodes.length,
            rowCount = table.rows.length;
        let row = table.insertRow(rowCount);
        //Iterate through each node
        for (let i = 0; i < nodes.length + 1; i++) {
            //Check if we are on the last filter
            if (i != nodes.length) {
                //Check if filter checkbox is enabled
                if (document.getElementById("enable" + nodes[i]).checked) {
                    row.insertCell(i).innerHTML = document.getElementById(nodes[i]).options[document.getElementById(nodes[i]).selectedIndex].text; //Insert a cell containing the currently selected item in the select
                } else {
                    //Otherwise if not checked just add a blank
                    row.insertCell(i).innerHTML = "";
                }
            } else {
                //Add a text remove button and set it's ID
                row.insertCell(i).innerHTML = `<p class="removeIcon">X</p>`;
                table.rows[rowCount].cells[i].id = "remove";
            }
        }
        jbUpdate();
    }
});
//Event listener for set defaults
document.getElementById("setDefaults").addEventListener("click", function () {
    if (jbIsAnyDefaultsSelected()) {
        //Set the default nodes
        let defaultNodes = ["languages", "os_types", "platforms"];
        //Iterate through each default node
        for (let i = 0; i < defaultNodes.length; i++) {
            //To get the correct column reference
            let offset = 3;
            //Check if filter is enabled, if so add the selected item into the cell
            if (document.getElementById("enable" + defaultNodes[i]).checked) {
                table.rows[1].cells[i + offset].innerHTML = document.getElementById(defaultNodes[i]).options[document.getElementById(defaultNodes[i]).selectedIndex].text;
            } else {
                //Otherwise add a blank
                table.rows[1].cells[i + offset].innerHTML = "";
            }
        }
        //Add a text remove icon and ID
        table.rows[1].cells[7].innerHTML = `<p class="removeIcon">X</p>`;
        table.rows[1].cells[7].id = "clear";
        jbUpdate();
    }
});
//Event listener for the table
table.addEventListener("click", function (e) {
    //Target the closest cell to the click
    let cell = e.target.closest('td');
    //If the cell is not null
    if (cell) {
        //Either remove the whole row (for products), or clear the appropriate cells (for defaults)
        if (cell.id == "remove") table.rows[cell.parentElement.rowIndex].remove();
        if (cell.id == "clear") {
            let defaultNodes = ["languages", "os_types", "platforms"];
            for (let i = 0; i < defaultNodes.length; i++) {
                let offset = 3;
                table.rows[1].cells[i + offset].innerHTML = "";
            }
        };
        jbUpdate();
    }
});
//Event listener for reset button
resetButton.addEventListener("click", function () { reset(); });
//Event listener for download button
jsonDownloadButton.addEventListener("click", function () { download("filter.json", outputBox.innerHTML); });
//Copy to clipboard - external library
let clipboard = new Clipboard(jsonCopyButton, {
    text: function () {
        jbUpdate();
        return outputBox.innerHTML;
    }
});
//Check if there are any filters selected
function isAnythingSelected() {
    let selected = false;
    //Iterate through each node
    for (let i = 0; i < nodes.length; i++) {
        if (document.getElementById("enable" + nodes[i]).checked == true) selected = true;
    }
    return selected;
}
//Check if any default filters are selected
function jbIsAnyDefaultsSelected() {
    let selected = false;
    //Iterate through each node starting from an offset of 3 and -1 to only collect defaults
    for (let i = 3; i < nodes.length - 1; i++) {
        if (document.getElementById("enable" + nodes[i]).checked == true) selected = true;
    }
    return selected;
}
//Reset prompt
function reset() {
    if (confirm("This will reset all configurations! Are you sure?")) location.reload();
}
//Download function which takes a filename and the text to add to it
function download(filename, text) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);
    if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    }
    else {
        pom.click();
    }
}
//Read text file function for parsing products.csv
function readTextFile(file) {
    let rawFile = new XMLHttpRequest();
    let allText = "";
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                allText = rawFile.responseText;
            }
        }
    }
    rawFile.send(null);
    return (allText);
}
//JSON parser
function jbGetJSON() {
    //Set the space value \t=tab ""=all on the same line
    enablePretty.checked ? json_space = "\t" : json_space = "";
    let json_use_legacy = use_legacy.checked,
        json_defaults_languages, json_defaults_platforms, json_defaults_os_types, json_products_app_id, json_products_name, json_products_version, json_product_languages, json_products_platforms, json_products_os_types, json_products, json_nodes = {}, products = [], defaults = [];
    //Iterate through defaults row and add this to json_nodes array
    for (i = 3; i < 6; i++) {
        if (table.rows[1].cells[i].innerHTML != "") json_nodes[nodes[i]] = table.rows[1].cells[i].innerHTML;
    }
    //Use undefined so that the item is ignored when using JSON.stringify
    //Check if json_nodes contains any key pairs, otherwise set defaults as undefined
    Object.keys(json_nodes).length == 0 ? defaults = undefined : defaults = json_nodes;
    //Iterate through each table row, starting from index 2 - under defaults
    for (let i = 2; i < table.rows.length; i++) {
        //Empty the json_nodes parent array
        json_nodes = {};
        //Iterate through each node
        for (let j = 0; j < nodes.length - 1; j++) {
            //Set each key to its value from the table, or set as undefined
            json_nodes[nodes[j]] = table.rows[i].cells[j].innerHTML || undefined;
        }
        //Push the node to the parent array products
        products.push(json_nodes);
    }
    //Check if the products array is empty, if so make it undefined to be ignored
    if (products.length == 0) products = undefined;
    //Finally construct the JSON and return it
    let JSONString = JSON.stringify({ use_legacy: json_use_legacy, defaults, products }, null, json_space);
    return JSONString;
}
//Main update function, called by various event listeners to trigger update of output box and filters
function jbUpdate() {
    let temp = [];
    //Iterate through products array
    for (i = 1; i < products.length; i++) {
        let include = true;
        //Iterate through the products child array
        for (j = 0; j < products[i].length - 1; j++) {
            //Check if filter is enabled and if the currently selected item matches a line in the array
            if ((document.getElementById("enable" + nodes[j]).checked && document.getElementById(nodes[j]).value != products[i][j])) {
                include = false;
            }
        }
        //If there are any matching items, add the whole line to the parent temp array
        if (include) temp.push(products[i]);
    }
    //Clear all select options if they exist
    for (i = 0; i < products.length - 1; i++) {
        if (document.getElementById(nodes[i]) != null) document.getElementById(nodes[i]).innerHTML = "";
    }
    //Second array in order to prevent duplication (will only add if an item with the same name is not found), and to filter out empty strings, and containing semi-colon
    let temp2 = [];
    //Iterate through the temp array
    for (i = 0; i < temp.length; i++) {
        //Iterate thorugh the temp child array
        for (j = 0; j < temp[i].length - 1; j++) {
            //Filter existing, emtpy, contains semi-colon
            if (temp2.indexOf(temp[i][j]) == -1 && temp[i][j] !== "" && !temp[i][j].includes(";")) {
                temp2.push(temp[i][j]);
                //Create the option
                let option = document.createElement("option");
                //Set the options value and text
                option.value = option.text = temp[i][j];
                //Append the option to the select
                document.getElementById(nodes[j]).appendChild(option);
            }
        }
    }
    //Set the output box to the output of the JSON parser
    document.getElementById("outputBox").innerHTML = jbGetJSON();
}
//First call of update
jbUpdate();