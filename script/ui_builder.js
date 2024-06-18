var getInternalURL = (url) => browser.runtime.getURL(url);

var popup_container;


document.body.style.border = "5px solid red"; //TODO: remove DEBUG indicator

var cloneAttributes = (source, target) => 
    Array.from(source.attributes).forEach(attr => target.setAttribute(attr.nodeName, attr.nodeValue));

async function loadDlPopup() {
    const response = await fetch(getInternalURL("../html/dl_popup.html"));
    return await response.text();
}
function addDlPopup() {
    document.body.append(popup_container.cloneNode(true));
    import(getInternalURL("../script/dl_popup.js")).then((module) => module.attachToPopup());
}
function openDlPopup() {
    if (!popup_container)
        loadDlPopup().then(text => { 
            popup_container = document.importNode(new DOMParser().parseFromString(text, "text/html").getElementById("popup-container"), true); 
            addDlPopup(); 
        });
    else
        addDlPopup();
}

function addDlButton() { //TODO: fix button not appering => wait for list_controls
    let list_controls = document.body.getElementsByTagName("app-anime-list-controls").item(0); //find the control panel
    let append_elem;
    if (list_controls.childElementCount == 1)
        append_elem = list_controls.children.item(0);
    else 
        append_elem = list_controls;
    let dl_btn = document.createElement("button"); // create download button

    dl_btn.textContent = "DL"; //TODO: replace with img
    let btn2 = append_elem.children.item(1)
    if (btn2) // style the button like the second on the control panel
        cloneAttributes(btn2, dl_btn);
    else { // if not possible revert to hardcoded style
        dl_btn.style.marginLeft = "5px";
        dl_btn.className = "btn control-button btn-success";
        dl_btn.type = "button";
    }

    dl_btn.onclick = openDlPopup;
    let create_pl_elem = append_elem.getElementsByClassName("float-right ml-auto").item(0); // find create playlist btn

    if (create_pl_elem)
        append_elem.insertBefore(dl_btn, create_pl_elem); // insert dl btn in before create plalist btn
    else 
        append_elem.append(dl_btn); // if not possible insert at the end of control panel
}

function main() {
    addDlButton();
}

main();