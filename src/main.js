let setDefaults = true, pElement, isWindows = true;
enableWindows.checked = true;
openSection(1, false, false);
openSection(2, true, false);

//Read in products.csv (obtained by running MirrorTool with --dryRun parameter) and split it by each new line/carraige return
temp = readTextFile("https://raw.githubusercontent.com/esetuk/mirrortoolconfigurator/master/res/products.csv").split(/[\r\n]+/),
    products = [],
    //Main nodes (exclude path as this is not required)
    nodes = ["app_id", "name", "version", "languages", "os_types", "platforms", "legacy"];

//Iterate through each line of products.csv
for (let i = 0; i < temp.length; i++) {
    //Split the lines by comma seperator and remove the path
    temp[i] = temp[i].split(",").slice(0, -1)
    for (let j = 0; j < temp[i].length; j++) {
        //Trim whitespace and add the element into the array
        temp[i][j] = temp[i][j].trim();
    }
    //Push each array into a parent array
    products.push(temp[i]);
}

//Event listeners
buttonClearFilters2.addEventListener("click", function () { clearFilters2(); });
document.getElementById("buttonSelectAll2").addEventListener("click", function () { selectAll2(); });
//main.addEventListener("change", function () { update2(); });
main.addEventListener("input", function () { update(); });
document.getElementById("buttonSetDefaults2").addEventListener("click", function () { setDefaults2(); });
buttonAddProduct2.addEventListener("click", function () { addProduct2(); });
table.addEventListener("click", function (e) { removeRow2(e); });
buttonReset2.addEventListener("click", function () { }); // TODO
downloadButton2.addEventListener("click", function () { download("filter.json", outputBox2.innerHTML); });
for (let i = 0; i < nodes.length; i++) {
    //document.getElementById(nodes[i]).addEventListener("change", function () { document.getElementById("enable" + nodes[i]).checked = true; update2(); });
    document.getElementById("enable" + nodes[i]).addEventListener("click", function () { update2(); });
}
expand1.addEventListener("click", function () { openSection(1, null, true); });
expand2.addEventListener("click", function () { openSection(2, null, true); });
resetButton.addEventListener("click", function () { reset(); });
enableWindows.addEventListener("click", function () { isWindows ? null : reset() });
enableLinux.addEventListener("click", function () { isWindows ? reset() : null });
downloadButton.addEventListener("click", function (event) { enableWindows.checked ? download('test.bat', hidden.textContent) : download('test.sh', hidden.textContent.split("sudo ").pop()); });

//Copy to clipboard - external library
let clipboard = new Clipboard(copyButton, {
    text: function () {
        update();
        return hidden.textContent;
    }
});

let clipboard2 = new Clipboard(copyButton2, {
    text: function () {
        update2();
        return outputBox2.innerHTML;
    }
});

function update() {
    updateBaseDirectory();
    //Master list of parameters - KEY: 0=name of parameter, 1=default value, 2=type of element, 3=section name, 4=optional
    let pList = [
        ["mirrorType", "regular", "select", "mirror", false],
        ["intermediateUpdateDirectory", updateBaseDirectory() + "mirrorTemp", "text", "mirror", false],
        ["offlineLicenseFilename", updateBaseDirectory() + "offline.lf", "text", "mirror", false],
        ["updateServer", "", "text", "mirror", true],
        ["outputDirectory", updateBaseDirectory() + "mirror", "text", "mirror", false],
        ["proxyHost", "", "text", "global", true],
        ["proxyPort", "", "text", "global", true],
        ["proxyUsername", "", "text", "global", true],
        ["proxyPassword", "", "password", "global", true],
        ["networkDriveUsername", "", "text", "mirror", true],
        ["networkDrivePassword", "", "password", "mirror", true],
        ["excludedProducts", "none", "select", "mirror", true],
        ["repositoryServer", "AUTOSELECT", "text", "repository", false],
        ["intermediateRepositoryDirectory", updateBaseDirectory() + "repositoryTemp", "text", "repository", false],
        ["mirrorOnlyLevelUpdates", false, "checkbox", "mirror", true],
        ["outputRepositoryDirectory", updateBaseDirectory() + "repository", "text", "repository", false],
        ["mirrorFileFormat", "none", "select", "mirror", true],
        ["compatibilityVersion", "", "text", "mirror", true],
        ["filterFilePath", updateBaseDirectory() + "filter.json", "text", "repository", true],
        ["trustDownloadedFilesInRepositoryTemp", false, "checkbox", "repository", true]
    ];

    let command = "", isOutputValid = 0;

    //Set default sections
    if (setDefaults) { enableMirror.checked = true; enableRepository.checked = false; enableGlobal.checked = false; enableOptional.checked = false; }

    for (let i = 0; i < pList.length; i++) {

        //Parameter aliases
        let pName = pList[i][0], pDefault = pList[i][1], pType = pList[i][2], pSectionCheckbox = document.getElementById("enable" + pList[i][3].charAt(0).toUpperCase() + pList[i][3].slice(1)), pOptional = pList[i][4];
        pElement = document.getElementById(pName);

        //Set defaults
        if (setDefaults) { pElement.value = pDefault; pElement.checked = pDefault; }
        let o = document.getElementsByClassName("optional");

        //Iterate through optional parameters, hide them if enableoptional is not checked
        for (let i = 0; i < o.length; i++) { enableOptional.checked ? o[i].style.display = "block" : o[i].style.display = "none"; }

        //Iterate through all the parameters
        if (pElement != null) {
            //Check if section is enabled, if so allow the mandatory parameters to be written to the output
            if (pSectionCheckbox.checked) {
                //Check if either optional parameters are enabled or optional parameters are disabled and current parameter is mandatory
                if (enableOptional.checked || !enableOptional.checked && pList[i][4] == false) {
                    //Add parameters, arguments and colour styles to the html
                    switch (pType) {
                        case ("text"):
                            if (pElement.value != "") command += "<colorParameter>--" + pName + "</colorParameter> <colorArgument>" + pElement.value + "</colorArgument> ";
                            break;
                        case ("checkbox"):
                            if (pElement.checked) command += "<colorParameter>--" + pName + "</colorParameter> ";
                            break;
                        case ("select"):
                            if (pElement.options[pElement.selectedIndex].text != "none") command += "<colorParameter>--" + pName + "</colorParameter> <colorArgument>" + pElement.options[pElement.selectedIndex].value + "</colorArgument> ";
                            break;
                        case ("password"):
                            if (pElement.value != "") command += "<colorParameter>--" + pName + "</colorParameter> <colorPassword>" + pElement.value + "</colorPassword> ";
                            break;
                    }
                }
            }
        }

        //If field is empty and mandatory then highlight the field red, modify the placeholder text, and declare the output as invalid
        if (pElement.value == "" && !pOptional && pSectionCheckbox.checked) {
            pElement.style.borderColor = "rgb(194, 71, 71)";
            pElement.placeholder = "This field cannot be blank";
            isOutputValid++
        } else {
            pElement.style.borderColor = "rgb(63, 63, 63)";
        }
    }

    //If the number of invalid fields are more than 0 or mandatory sections are disabled the disable the copy and download buttons, otherwise show them
    if (isOutputValid > 0 || (!enableMirror.checked && !enableRepository.checked)) {
        copyButton.disabled = downloadButton.disabled = outputBox.disabled = true;
    } else {
        copyButton.disabled = downloadButton.disabled = outputBox.disabled = false;
    }

    //Trim whitespace
    command = command.trim();

    //Check if there is anything to write and if the output is valid, if so write the platform specific prefix plus the commands to the command
    if (command.length != 0 && isOutputValid == 0) {
        if (enableWindows.checked) {
            command = "<colorStart>MirrorTool.exe</colorStart> " + command
        } else {
            command = "<colorStart>sudo ./MirrorTool</colorStart> " + command
        }
    } else {
        command = "<colorWarn>Some parameter sections are not enabled, or mandatory fields are empty. Check your configuration.</colorWarn>";
    }

    hidden.innerHTML = command;

    //Replace passwords with 'hidden' text
    let passwordReplaceText = "&lt;hidden&gt;";
    if (document.getElementById("networkDrivePassword").value != "" && document.getElementById("networkDrivePassword").value != null) command = command.replace(new RegExp("--networkDrivePassword</colorParameter> <colorPassword>" + document.getElementById("networkDrivePassword").value), "--networkDrivePassword</colorParameter> <colorPassword>" + passwordReplaceText);
    if (document.getElementById("proxyPassword").value != "" && document.getElementById("proxyPassword").value != null) command = command.replace(new RegExp("--proxyPassword</colorParameter> <colorPassword>" + document.getElementById("proxyPassword").value), "--proxyPassword</colorParameter> <colorPassword>" + passwordReplaceText);

    //Render the command
    outputBox.innerHTML = command;

    //Show or hide sections based on checkbox states
    enableMirror.checked ? mirror.style.display = "block" : mirror.style.display = "none";
    enableRepository.checked ? repository.style.display = "block" : repository.style.display = "none";
    enableGlobal.checked ? global.style.display = "block" : global.style.display = "none";

    setDefaults = false;
}

update();
update2();

//Update the base directory strings and determine if Windows is selected
function updateBaseDirectory() {
    if (enableWindows.checked) { isWindows = true; b = "C:\\mirrorTool\\"; } else { b = "/tmp/mirrorTool/"; isWindows = false; }
    return b;
}

//Open a section or toggle it, change the icon
function openSection(n, open, toggle) {
    let section = [expandSection1, expandSection2, expand1, expand2, "Command Line Configuration", "JSON Filter Configuration"];
    toggle ? section[n - 1].hidden ? open = true : open = false : null;
    open ? icon = "▼" : icon = "▲";
    section[n - 1].hidden = !open;
    section[n + 1].innerHTML = section[n + 3] + " " + icon;
    window.scrollTo(0, document.body.scrollHeight);
}

//Scroll to bottom of document
function scrollToBottom() {
    window.scrollTo(0, document.body.scrollHeight);
}

//Reset for command line configuration
function reset() {
    setDefaults = confirm("Reset all settings and filters?");
    update();
}

//Clear filters in json configuration
function clearFilters2() {
    for (let i = 0; i < nodes.length; i++) {
        document.getElementById("enable" + nodes[i]).checked = false;
    }
    update2();
}

//Select all filters in json configuration
function selectAll2() {
    for (let i = 0; i < nodes.length; i++) {
        if (document.getElementById("enable" + nodes[i]).disabled == false) document.getElementById("enable" + nodes[i]).checked = true;
    }
    update2();
}
function selectIsMultiple(select) {
    return document.getElementById(select).multiple;
}
function addProduct2() {
    //Check if anything is selected, otherwise do nothing
    if (isAnythingSelected2()) {
        //Get the rows and columns count
        rowCount = table.rows.length;
        let row = table.insertRow(rowCount);
        //Iterate through each node
        for (let i = 0; i < nodes.length + 1; i++) {
            //Check if we are on the last filter
            if (i != nodes.length) {
                //Check if filter checkbox is enabled
                if (document.getElementById("enable" + nodes[i]).checked) {
                    if (selectIsMultiple(nodes[i])) {
                        row.insertCell(i).innerHTML = getSelected(document.getElementById(nodes[i]));
                    } else {
                        row.insertCell(i).innerHTML = document.getElementById(nodes[i]).options[document.getElementById(nodes[i]).selectedIndex].text; //Insert a cell containing the currently selected item in the select
                    }
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
        update2();
    }
}

function removeRow2(e) {
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
        update2();
    }
}

//Set defaults
function setDefaults2() {
    if (IsAnyDefaultsSelected2()) {
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
        update2();
    }
}

//Check if there are any filters selected
function isAnythingSelected2() {
    let selected = false;
    //Iterate through each node
    for (let i = 0; i < nodes.length; i++) {
        if (document.getElementById("enable" + nodes[i]).checked == true) selected = true;
    }
    return selected;
}

//Check if any default filters are selected
function IsAnyDefaultsSelected2() {
    let selected = false;
    //Iterate through each node starting from an offset of 3 and -1 to only collect defaults
    for (let i = 3; i < nodes.length - 1; i++) {
        if (document.getElementById("enable" + nodes[i]).checked == true) selected = true;
    }
    selected ? document.getElementById("buttonSetDefaults2").disabled = false : document.getElementById("buttonSetDefaults2").disabled = true;
    return selected;
}

//Check if product or app_id is selected
function IsAnyProductsSelected2() {
    let selected = false;
    //Iterate through each node starting from an offset of 3 and -1 to only collect defaults
    for (let i = 0; i < 2; i++) {
        if (document.getElementById("enable" + nodes[i]).checked == true) selected = true;
    }
    selected ? buttonAddProduct2.disabled = false : buttonAddProduct2.disabled = true;
    return selected;
}

//JSON reset prompt
//Not implemented yet
function reset2() {
    //if (confirm("This will reset all JSON filter configurations! Are you sure?")) {}
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
function GetJSON() {
    //Set the space value \t=tab ""=all on the same line
    enablePretty.checked ? json_space = "\t" : json_space = "";
    let json_use_legacy = use_legacy.checked, json_nodes = {}, products = [], defaults = [];
    //Iterate through defaults row and add this to json_nodes array
    for (let i = 3; i < 6; i++) {
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

function getSelected(select) {
    let result = [];
    if (document.getElementById(select) != null) {
        for (let i = 0; i < document.getElementById(select).length; i++) {
            if (document.getElementById(select).options[i].selected) result.push(document.getElementById(select).options[i].value);
        }
    }
    return result;
}

//Main update function, called by various event listeners to trigger update of output box and filters
function update2() {
    IsAnyProductsSelected2();
    IsAnyDefaultsSelected2();
    let temp = [];
    //Iterate through products array
    for (let i = 1; i < products.length; i++) {
        let include = true;
        //Iterate through the products child array
        for (let j = 0; j < nodes.length; j++) {
            let selected = [];
            //Check if filter is enabled and if the currently selected item matches a line in the array
            if (!document.getElementById("enable" + nodes[j]).checked) continue;
            if (i == 1) selected = getSelected(nodes[j]); //Only get selected items once
            if (selectIsMultiple(nodes[j]) && selected.length > 0) {
                        include = false;
                        for (let k = 0; k < selected.length; k++) {
                            //-----------------HERE--------------------
                                if (selected[k] == products[i][j]) include = true;
                            }
                        } else {
                                if (document.getElementById(nodes[j]).value != products[i][j]) include = false;
                }
            }
            //If there are any matching items, add the whole line to the parent temp array
            if (include) temp.push(products[i]);
        }
        //Clear all select options prior to re-populating and disable any empty ones
        for (let i = 0; i < nodes.length; i++) {
            let node = document.getElementById(nodes[i]);
            if (node != null) node.innerHTML = "";
        }
        //Second array in order to prevent duplication (will only add if an item with the same name is not found), and to filter out empty strings, and containing semi-colon
        let temp2 = [];
        //Iterate through the temp array
        for (let i = 0; i < temp.length; i++) {
            //Iterate through the temp child array
            for (let j = 0; j < temp[i].length - 1; j++) {
                //Filter existing, empty, contains semi-colon
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
        //Iterate through each node
        for (let i = 0; i < nodes.length; i++) {
            let node = document.getElementById(nodes[i]);
            let isNode = document.getElementById("enable" + nodes[i]);
            //If no sub options
            if (node.length == 0) {
                //Disable the select and its corresponding checkbox
                node.disabled = true;
                isNode.disabled = true;
            } else {
                //Enable the select and its corresponding checkbox
                node.disabled = false;
                isNode.disabled = false;
            }
        }
        //Set the output box to the output of the JSON parser
        document.getElementById("outputBox2").innerHTML = GetJSON();
    }