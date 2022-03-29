//Functions for JSON configuration

let optionsFiltered, compactJSON = true,  isSetAppDefaults2 = false;

temp = readTextFile("/res/products.csv").split(/[\r\n]+/),
    products = [], productsFiltered = [], nodes = ["app_id", "name", "version", "languages", "os_types", "platforms", "legacy"];
for (let i = 0; i < temp.length; i++) {
    temp[i] = temp[i].split(",").slice(0, -1)
    for (let j = 0; j < temp[i].length; j++) {
        temp[i][j] = temp[i][j].trim();
    }
    products.push(temp[i]);
}
products.shift();

buttonSetDefaults2.addEventListener("click", function () { setDefaults2(); });
buttonAddProduct2.addEventListener("click", function () { addProduct2(); });
table.addEventListener("click", function (e) { removeRow2(e); });
buttonReset2.addEventListener("click", function () { reset2(); });
downloadButton2.addEventListener("click", function () { download("filter.json", outputBox2.innerHTML); });
for (let i = 0; i < nodes.length; i++) {
    if (i < 3 || i > 5) {
        document.getElementById(nodes[i]).addEventListener("change", function (e) {
            document.getElementById("enable" + nodes[i]).checked = true;
            update2();
        });
    } else {
        document.getElementById(nodes[i]).addEventListener("focusout", function (e) {
            if (anyOptionsSelected2(i)) {
                document.getElementById("enable" + nodes[i]).checked = true;
                update2();
            }
        });
    }
    document.getElementById("enable" + nodes[i]).addEventListener("click", function () {
        document.getElementById(nodes[i]).selectedIndex = 0;
        update2();
    });
}
enableversion.addEventListener("click", function () { update2(); });
versionTo.addEventListener("change", function () {
    enableversionTo.checked = true;
    update2();
});
enableversionTo.addEventListener("click", function (e) { update2(); });
versionOperator.addEventListener("change", function (e) { update2(); });
use_legacy.addEventListener("click", function () { update2(); });
resetButton.addEventListener("click", function () { reset(); });
enableWindows.addEventListener("click", function () { isWindows ? null : reset() });
enableLinux.addEventListener("click", function () { isWindows ? reset() : null });
buttonClearFilters2.addEventListener("click", function () { clearFilters2(); update2(); });
buttonCompact2.addEventListener("click", function () {
    compactJSON ? compactJSON = false : compactJSON = true;
    update2();
});

let clipboard2 = new Clipboard(copyButton2, {
    text: function () {
        update2();
        toast("Copied to clipboard!", 1000);
        return outputBox2.innerHTML;
    }
});

update2();

function selectIsMultiple2(name) {
    return document.getElementById(name).multiple;
}

function clearFilters2() {
    for (let i = 0; i < nodes.length; i++) {
        document.getElementById("enable" + nodes[i]).checked = false;
    }
}

function selectAll2() {
    for (let i = 0; i < nodes.length; i++) {
        if (document.getElementById("enable" + nodes[i]).disabled == false) document.getElementById("enable" + nodes[i]).checked = true;
    }
}

function removeRow2(e) {
    let cell = e.target.closest('td');
    if (cell) {
        if (cell.id == "remove") table.rows[cell.parentElement.rowIndex].remove();
        if (cell.id == "clear") {
            let defaultNodes = ["languages", "os_types", "platforms"];
            for (let i = 0; i < defaultNodes.length; i++) {
                let offset = 3;
                table.rows[1].cells[i + offset].innerHTML = "";
            }
        };
        updateJSON();
    }
}

function removeAllRows2() {
    for (let i = 1; i < table.rows.length; i++) {
        if (table.rows[i]) {
            if (i > 1) {
                table.rows[i].remove();
                i--;
            } else {
                for (let j = 3; j < nodes.length - 1; j++) {
                    table.rows[1].cells[j].innerHTML = "";
                }
            }
            updateJSON();
        }
    }
}

function setAppDefaults2() {
    isSetAppDefaults2 = false;
    use_legacy.checked = false;
    versionTo.disabled = true;
    versionOperator.value = "=";
    enableversionTo.disabled = true;
    compactJSON = true;
    clearFilters2();
    removeAllRows2();
    update2();
}

function addProduct2() {
    if (isAnythingSelected2()) {
        rowCount = table.rows.length;
        let row = table.insertRow(rowCount);
        for (let i = 0; i <= nodes.length; i++) {
            if (i != nodes.length) {
                if (document.getElementById("enable" + nodes[i]).checked) {
                    if (selectIsMultiple2(nodes[i])) {
                        row.insertCell(i).innerHTML = getSelected2(nodes[i]);
                    } else {
                        if (i == 2) {
                            row.insertCell(i).innerHTML = versionStringBuilder();
                        } else {
                            row.insertCell(i).innerHTML = document.getElementById(nodes[i]).options[document.getElementById(nodes[i]).selectedIndex].text;
                        }
                    }
                } else {
                    row.insertCell(i).innerHTML = "";
                }
            } else {
                row.insertCell(i).innerHTML = `<p class="removeIcon">✖</p>`;
                table.rows[rowCount].cells[i].id = "remove";
            }
        }
        clearFilters2();
        update2();
    }
}

function setDefaults2() {
    if (IsAnyDefaultsSelected2()) {
        for (let i = 3; i < nodes.length - 1; i++) {
            if (document.getElementById("enable" + nodes[i]).checked) {
                table.rows[1].cells[i].innerHTML = getSelected2(nodes[i]);
            } else {
                table.rows[1].cells[i].innerHTML = "";
            }
        }
        table.rows[1].cells[7].innerHTML = `<p class="removeIcon">✖</p>`;
        table.rows[1].cells[7].id = "clear";
    }
    clearFilters2();
    update2();
}

function reset2() {
    if (confirm("This will reset all JSON filter configurations! Are you sure?")) {
        isSetAppDefaults2 = true;
    }
    update2();
}

function isAnythingSelected2() {
    let selected = false;
    for (let i = 0; i < nodes.length; i++) {
        if (document.getElementById("enable" + nodes[i]).checked) selected = true;
    }
    return selected;
}

function IsAnyDefaultsSelected2() {
    let selected = false;
    for (let i = 3; i < nodes.length - 1; i++) {
        if (document.getElementById("enable" + nodes[i]).checked == true) selected = true;
    }
    selected ? document.getElementById("buttonSetDefaults2").disabled = false : document.getElementById("buttonSetDefaults2").disabled = true;
    return selected;
}

function IsAnyProductsSelected2() {
    let selected = false;
    for (let i = 0; i < 2; i++) {
        if (document.getElementById("enable" + nodes[i]).checked == true) selected = true;
    }
    selected ? buttonAddProduct2.disabled = false : buttonAddProduct2.disabled = true;
    return selected;
}

function getSelected2(select) {
    let result = [];
    if (document.getElementById(select) != null) {
        for (let i = 0; i < document.getElementById(select).length; i++) {
            if (document.getElementById(select).options[i].selected) result.push(document.getElementById(select).options[i].value);
        }
    }
    return result;
}

function getAllOptions2(index) {
    let result = [];
    for (let i = 0; i < productsFiltered.length; i++) {
        if
            (
            result.indexOf(productsFiltered[i][index]) == -1
        )
            result.push(productsFiltered[i][index]);
    }
    return result;
}

function fillSelect2(index) {
    document.getElementById(nodes[index]).innerHTML = "";
    for (let i = 0; i < optionsFiltered[index].length; i++) {
        let opt = document.createElement("option");
        switch (optionsFiltered[index][i]) {
            case ("1"):
                opt.text = "yes";
                break;
            case ("0"):
                opt.text = "no";
                break;
            default:
                opt.text = optionsFiltered[index][i];
                break;
        }
        opt.value = optionsFiltered[index][i];
        document.getElementById(nodes[index]).appendChild(opt);
    }
}

function anyOptionsSelected2(index) {
    let result = false;
    if (document.getElementById(nodes[index]) != null) {
        for (let i = 0; i < document.getElementById(nodes[index]).length; i++) {
            if (document.getElementById(nodes[index]).options[i].selected) result = true;
        }
    }
    return result;
}

function updateSelect2(index) {
    for (let i = 0; i < document.getElementById(nodes[index]).length; i++) {
        if (!document.getElementById(nodes[index]).options[i].selected) {
            document.getElementById(nodes[index]).removeChild(document.getElementById(nodes[index]).options[i]);
            i--;
        }
    }
}

function sortNode(index) {
    index == 2 ? optionsFiltered[index] = optionsFiltered[index].sort(function (a, b) { return a - b; }) : optionsFiltered[index] = optionsFiltered[index].sort();
}

function versionStringBuilder() {
    let versionString = "";
    let operator = versionOperator.value;
    if (operator == "=") operator = "";
    if (document.getElementById("enableversion").checked || document.getElementById("enableversionTo").checked) versionString += operator;
    if (document.getElementById("enableversion").checked) versionString += version.value;
    if (document.getElementById("enableversionTo").checked) versionString = version.value + " - " + versionTo.value;
    return versionString;
}

function update2() {
    if (isSetAppDefaults2) setAppDefaults2();
    IsAnyProductsSelected2();
    IsAnyDefaultsSelected2();
    versionTo.disabled = enableversionTo.disabled = (versionOperator.value != "=" || !enableversion.checked);
    versionOperator.disabled = enableversionTo.checked;
    if (!enableversion.checked) enableversionTo.checked = false;

    if (isAnythingSelected2()) buttonClearFilters2.disabled = false; else buttonClearFilters2.disabled = true;
    productsFiltered = products.map(inner => inner.slice());
    options = [];
    for (let i = 0; i < nodes.length; i++) {
        if (document.getElementById("enable" + nodes[i]).checked) {
            if (selectIsMultiple2(nodes[i]) && document.getElementById(nodes[i]).length > 0) {
                options.push(getSelected2(nodes[i]));
            } else {
                options.push([document.getElementById(nodes[i]).value]);
            }
        } else {
            options.push(getAllOptions2(i));
        }
    }
    let remove;
    for (let i = 0; i < productsFiltered.length; i++) {
        remove = false;
        for (let j = 0; j < options.length; j++) {
            let values = productsFiltered[i][j].split(";");
            for (let k = 0; k < values.length; k++) {
                if (!options[j].filter(element => element.includes(values[k])).length > 0 || values[k] == "") { remove = true; continue; }
            }
        }
        if (remove) { productsFiltered.splice(i, 1); i--; };
    }
    optionsFiltered = [[], [], [], [], [], [], []];
    for (let i = 0; i < productsFiltered.length; i++) {
        for (let j = 0; j < nodes.length; j++) {
            let value = productsFiltered[i][j];
            if (value.includes(";")) {
                let vs = value.split(";")
                for (let k = 0; k < vs.length; k++) {
                    if (optionsFiltered[j].indexOf(vs[k]) == -1) {
                        optionsFiltered[j].push(vs[k]);
                    }
                }
            } else {
                if (optionsFiltered[j].indexOf(value) == -1) {
                    optionsFiltered[j].push(value);
                }
            }
        }
    }
    if (!enableversion.checked) versionTo.innerHTML = version.innerHTML;
    for (let i = 0; i < nodes.length; i++) {
        sortNode(i);
        if (document.getElementById("enable" + nodes[i]).checked) {
            if (selectIsMultiple2(nodes[i]) && document.getElementById(nodes[i]).length > 0) {
                updateSelect2(i);
            } else {
                updateSelect2(i);
            }
        } else {
            fillSelect2(i);
        }
    }
    updateJSON();
}

function updateJSON() {
    compactJSON ? json_space = 0 : json_space = "\t";
    let json_use_legacy = use_legacy.checked, json_nodes = {}, products = [], defaults = [];
    for (let i = 3; i < nodes.length - 1; i++) {
        if (table.rows[1].cells[i].innerHTML != "")
        table.rows[1].cells[i].innerHTML.includes(",") ? json_nodes[nodes[i]] = table.rows[1].cells[i].innerHTML.split(",") : json_nodes[nodes[i]] = table.rows[1].cells[i].innerHTML;
    }
    Object.keys(json_nodes).length == 0 ? defaults = undefined : defaults = json_nodes;
    for (let i = 2; i < table.rows.length; i++) {
        json_nodes = {};
        for (let j = 0; j < nodes.length - 1; j++) {
            if (table.rows[i].cells[j].innerHTML != "")
            table.rows[i].cells[j].innerHTML.includes(",") ? json_nodes[nodes[j]] = table.rows[i].cells[j].innerHTML.split(",") : json_nodes[nodes[j]] = table.rows[i].cells[j].innerHTML; else json_nodes[nodes[j]] = undefined;
        }
        products.push(json_nodes);
    }
    if (products.length == 0) products = undefined;
    outputBox2.innerHTML = JSON.stringify({ use_legacy: json_use_legacy, defaults, products }, null, json_space);
}