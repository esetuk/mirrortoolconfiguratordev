//Generic functions for the document

openSection(1);

menuBar.addEventListener("click", function (e) {
    if (e.target.id != "menuBar") {
        if (e.target.id == "menuItem1") openSection(1);
        if (e.target.id == "menuItem2") openSection(2);
    }
});

function openSection(id) {
    if (id == 2) {
        layerCLI.style.display = "none";
        layerJSON.style.display = "block";
        menuItem1.style = "border: 0";
        menuItem2.style = "border-bottom: 3px solid white";
    } else {
        layerCLI.style.display = "block";
        layerJSON.style.display = "none";
        menuItem1.style = "border-bottom: 3px solid white";
        menuItem2.style = "border: 0";
    }
}

function toast(msg) {
    let el = document.createElement("div");
    el.setAttribute("style", `font-size:small;position:absolute;top:10px;left:5px;width:auto;text-height:20px;padding:5px;text-align:center;vertical-align:middle;`);
    el.innerHTML = msg;
    setTimeout(function () {
        el.parentNode.removeChild(el);
    }, 1000);
    document.body.appendChild(el);
}

function download(filename, text) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);
    if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    } else {
        pom.click();
    }
}

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