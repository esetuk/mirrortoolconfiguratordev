let setDefaults = true,
parameterList;
enableWindows.checked = true;
function update() {
    let s = "",
    isOutputValid = 0;
    enableWindows.checked ? baseDirectory = "c:\\mirrorTool\\" : baseDirectory = "/tmp/mirrorTool/";
    if (setDefaults){
        enableMirror.checked = true;
        enableRepository.checked = false;
        enableGlobal.checked = false;
        enableOptional.checked = false;
        //master list of parameters
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
        //aliases
        let pName = parameterList[i][0];
        let pElement = document.getElementById(pName);
        let pDefault = parameterList[i][1];
        let pType = parameterList[i][2];
        let pSection = parameterList[i][3];
        let pOptional = parameterList[i][4];
        if (setDefaults)
        {
            pElement.value = pDefault;
            pElement.checked = pDefault;
        }
        let o = document.getElementsByClassName("optional");
        //iterate through optional parameters, hide them if enableoptional is not checked
        for (let i = 0; i < o.length; i++) {
            enableOptional.checked ? o[i].style.display = "block" : o[i].style.display = "none";
        }
        //iterate through all the parameters
        if (pElement != null) {
            //check if section is enabled, if so allow the mandatory parameters to be written to the output
            if ((enableMirror.checked && pSection == "mirror") || (enableRepository.checked && pSection == "repository") || (enableGlobal.checked && pSection == "global")) {
                //check if either optional parameters are enabled or optional parameters are disabled and current parameter is mandatory
                if (enableOptional.checked || !enableOptional.checked && parameterList[i][4] == false) {
                    switch (pType) {
                        case ("text"):
                            //write parameter and args for text box
                            if (pElement.value != "") s += "--" + pName + " " + pElement.value + " ";
                            break;
                        case ("checkbox"):
                            //write parameter for checkbox
                            if (pElement.checked) s += "--" + pName + " ";
                            break;
                        case ("select"):
                            //write parameter for currently selected item in dropdown box and args
                            if (pElement.options[pElement.selectedIndex].text != "none") s += "--" + pName + " " + pElement.options[pElement.selectedIndex].value + " ";
                            break;
                    }
                }
            }
        }
        //if field is empty and mandatory then highlight the field red, modify the placeholder text, and declare the output as invalid
        if (pElement.value == "" && !pOptional) {
            pElement.style.borderColor = "red";
            pElement.placeholder = "This field cannot be blank";
            isOutputValid++
        } else {
            pElement.style.borderColor = "rgb(63, 63, 63)";
        }
    }
    //if the number of invalid fields are more than 0 or mandatory sections are disabled the disable the copy and download buttons, otherwise show them
    if (isOutputValid > 0 || (!enableMirror.checked && !enableRepository.checked)) {
        copyButton.disabled = true;
        downloadButton.disabled = true;
        commandPreview.disabled = true;
    } else {
        copyButton.disabled = false;
        downloadButton.disabled = false;
        commandPreview.disabled = false;
    }
    //trim whitespace
    s = s.trim();
    //check if there is anything to write and if the output is valid, if so write the platform specific prefix plus the commands to the command preview
    if (s.length != 0 && isOutputValid == 0) {
        enableWindows.checked ? commandPreview.innerHTML = "MirrorTool.exe " + s : commandPreview.innerHTML = "sudo ./MirrorTool " + s
    } else commandPreview.innerHTML = "";
    //show or hide sections based on checkbox states
    enableMirror.checked ? mirror.style.display = "block" : mirror.style.display = "none";
    enableRepository.checked ? repository.style.display = "block" : repository.style.display = "none";
    enableGlobal.checked ? global.style.display = "block" : global.style.display = "none";
    //workaround for auto-sizing the command line preview box
    commandPreview.setAttribute("style", "height: 0px");
    commandPreview.setAttribute("style", "height:" + (commandPreview.scrollHeight) + "px;overflow-y:hidden;");
    setDefaults = false;
}
update();
//copy to clipboard
var clipboard = new Clipboard(document.getElementById('copyButton'), {
    text: function () {
        update();
        return commandPreview.innerHTML;
    }
});
//event listeners for updating command line preview
downloadButton.addEventListener("click", function (event) {
    if (commandPreview.innerHTML != ""){
        if (enableWindows.checked) {
            download('test.bat', commandPreview.innerHTML);
         } else {
            let s = commandPreview.innerHTML;
            s = "#!/usr/bin/env bash\n" + (s.split("sudo ").pop());
            download('test.sh', s);
         }
    } else alert("Command line cannot be empty");
});
let input = document.querySelectorAll("input");
for (i = 0; i < input.length; i++) {
    input[i].addEventListener("input", function () {
        update();
    });
}
mirrorType.addEventListener("input", function () { update(); });
mirrorFileFormat.addEventListener("input", function () { update(); });
excludedProducts.addEventListener("input", function () { update(); });
enableWindows.addEventListener("click", function () {
        setDefaults = question();
        update(); 
});
enableLinux.addEventListener("click", function () {
        setDefaults = question();
        update();
});
//scroll to bottom when section expands to ensure visibility
mirror.addEventListener("input", function() { scrollToBottom() });
repository.addEventListener("input", function() { scrollToBottom() });
global.addEventListener("input", function() { scrollToBottom() });
enableOptional.addEventListener("input", function() { scrollToBottom() });
function scrollToBottom(){
    window.scrollTo(0,document.body.scrollHeight);
}
function question(){
    return (confirm("Reset all mandatory parameters to their platform specific default values?"));
}
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