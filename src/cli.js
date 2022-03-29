//Functions for CLI configuration

let setDefaults = true, pElement, isWindows = true;
enableWindows.checked = true; 

let clipboard = new Clipboard(copyButton, {
    text: function () {
        update();
        toast("Copied to clipboard!", 1000);
        return hidden.textContent;
    }
});

configureLink.addEventListener("click", function () { openSection(2); });
layerCLI.addEventListener("input", function () { update(); });
downloadButton.addEventListener("click", function () {
    enableWindows.checked ? download('test.bat', hidden.textContent) : download
        ('test.sh', hidden.textContent.split("sudo ").pop());
});

update();

function update() {
    let baseDirectory = updateBaseDirectory();
    let pList = [
        ["mirrorType", "regular", "select", "mirror", false],
        ["intermediateUpdateDirectory", baseDirectory + "mirrorTemp", "text", "mirror", false],
        ["offlineLicenseFilename", baseDirectory + "offline.lf", "text", "mirror", false],
        ["updateServer", "", "text", "mirror", true],
        ["outputDirectory", baseDirectory + "mirror", "text", "mirror", false],
        ["proxyHost", "", "text", "global", true],
        ["proxyPort", "", "text", "global", true],
        ["proxyUsername", "", "text", "global", true],
        ["proxyPassword", "", "password", "global", true],
        ["networkDriveUsername", "", "text", "mirror", true],
        ["networkDrivePassword", "", "password", "mirror", true],
        ["excludedProducts", "none", "select", "mirror", true],
        ["repositoryServer", "AUTOSELECT", "text", "repository", false],
        ["intermediateRepositoryDirectory", baseDirectory + "repositoryTemp", "text", "repository", false],
        ["mirrorOnlyLevelUpdates", false, "checkbox", "mirror", true],
        ["outputRepositoryDirectory", baseDirectory + "repository", "text", "repository", false],
        ["mirrorFileFormat", "none", "select", "mirror", true],
        ["compatibilityVersion", "", "text", "mirror", true],
        ["filterFilePath", baseDirectory + "filter.json", "text", "repository", true],
        ["trustDownloadedFilesInRepositoryTemp", false, "checkbox", "repository", true]
    ];
    let command = "", isOutputValid = 0;
    if (setDefaults) { enableMirror.checked = true; enableRepository.checked = false; enableGlobal.checked = false; enableOptional.checked = false; }
    let o = document.getElementsByClassName("optional");
    for (let i = 0; i < o.length; i++) { enableOptional.checked ? o[i].style.display = "block" : o[i].style.display = "none"; }
    for (let i = 0; i < pList.length; i++) {
        let pName = pList[i][0], pDefault = pList[i][1], pType = pList[i][2], pSectionCheckbox = document.getElementById("enable" + pList[i][3].charAt(0).toUpperCase() + pList[i][3].slice(1)), pOptional = pList[i][4];
        pElement = document.getElementById(pName);
        if (setDefaults) { pElement.value = pDefault; pElement.checked = pDefault; }
        if (pElement != null) {
            if (pSectionCheckbox.checked) {
                if (enableOptional.checked || !enableOptional.checked && pList[i][4] == false) {
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
        if (pElement.value == "" && !pOptional && pSectionCheckbox.checked) {
            pElement.style.borderColor = "rgb(194, 71, 71)";
            pElement.placeholder = "This field cannot be blank";
            isOutputValid++
        } else {
            pElement.style.borderColor = "rgb(63, 63, 63)";
        }
    }
    if (isOutputValid > 0 || (!enableMirror.checked && !enableRepository.checked)) {
        copyButton.disabled = downloadButton.disabled = outputBox.disabled = true;
    } else {
        copyButton.disabled = downloadButton.disabled = outputBox.disabled = false;
    }
    command = command.trim();
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
    let passwordReplaceText = "&lt;hidden&gt;";
    if (document.getElementById("networkDrivePassword").value != "" && document.getElementById("networkDrivePassword").value != null) command = command.replace(new RegExp("--networkDrivePassword</colorParameter> <colorPassword>" + document.getElementById("networkDrivePassword").value), "--networkDrivePassword</colorParameter> <colorPassword>" + passwordReplaceText);
    if (document.getElementById("proxyPassword").value != "" && document.getElementById("proxyPassword").value != null) command = command.replace(new RegExp("--proxyPassword</colorParameter> <colorPassword>" + document.getElementById("proxyPassword").value), "--proxyPassword</colorParameter> <colorPassword>" + passwordReplaceText);
    outputBox.innerHTML = command;
    enableMirror.checked ? mirror.style.display = "block" : mirror.style.display = "none";
    enableRepository.checked ? repository.style.display = "block" : repository.style.display = "none";
    enableGlobal.checked ? global.style.display = "block" : global.style.display = "none";
    setDefaults = false;
}

function updateBaseDirectory() {
    if (enableWindows.checked) { isWindows = true; b = "C:\\mirrorTool\\"; } else { b = "/tmp/mirrorTool/"; isWindows = false; }
    return b;
}

function reset() {
    setDefaults = confirm("Reset all settings and filters?");
    update();
}

