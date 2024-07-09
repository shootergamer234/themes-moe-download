var getInternalURL = url => chrome.runtime.getURL(url);

var popup_container;
var list_controls;

document.body.style.border = "5px solid red"; //TODO: remove DEBUG indicator

/**
 * Clones all attributes from one Node to another.
 * @param {Node} source - Node from which to copy all attributes.
 * @param {Node} target - Node that receives the same attributes.
 */
var cloneAttributes = (source, target) => 
    Array.from(source.attributes).forEach(attr => target.setAttribute(attr.nodeName, attr.nodeValue));
/**
 * Allows waiting for a Element to appear in DOM.
 * @param {string} selector - The CSS selector matching the searched Element.
 * @returns {Element} First element found matching the selector.
 */
function waitForElem(selector) {
    return new Promise(resolve => {
        let elem = document.querySelector(selector);
        if (elem)
            return resolve(elem);

        const observer = new MutationObserver((mutations, obsv) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    let queryNode;
                    if (node.nodeType == Node.ELEMENT_NODE)
                        queryNode = node.querySelector(selector);

                    if (queryNode) {
                        obsv.disconnect();
                        resolve(queryNode);
                    }
                })
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

async function loadDlPopup() {
    const response = await fetch(getInternalURL("../html/dl_popup.html"));
    return await response.text();
}
function addDlPopup() {
    document.body.append(popup_container.cloneNode(true));
    import(getInternalURL("../script/dl_popup.js")).then(module => module.attachToPopup());
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

function addDlButton() {
    let append_elem;
    if (list_controls.childElementCount == 1)
        append_elem = list_controls.children.item(0); // append to the div containing the buttons
    else 
        append_elem = list_controls; // fallback if thats not possible
    let dl_btn = document.createElement("button"); // create download button

    if (document.fonts.check("1em fa-solid-900")) { // if fontawesome webfont is available use its symbols
        let dl_btn_symbol = document.createElement("i");
        dl_btn_symbol.className = "fa fa-fw fa-download";
        dl_btn.appendChild(dl_btn_symbol);
    }
    else // if not available fallback to text representation
        dl_btn.textContent = "DL";
    let btn2 = append_elem.children.item(1)
    if (btn2) // style the button like the second on the control panel
        cloneAttributes(btn2, dl_btn);
    else { // if not possible revert to hardcoded style
        dl_btn.style.marginLeft = "5px";
        dl_btn.className = "btn control-button btn-success";
        dl_btn.type = "button";
    }

    dl_btn.addEventListener("click", openDlPopup);
    let create_pl_elem = append_elem.getElementsByClassName("float-right ml-auto").item(0); // find create playlist btn

    if (create_pl_elem)
        append_elem.insertBefore(dl_btn, create_pl_elem); // insert dl btn in before create plalist btn
    else 
        append_elem.append(dl_btn); // if not possible insert at the end of control panel
}

async function main() {
    list_controls = await waitForElem("app-anime-list-controls"); // find the control panel and safe it for later
    addDlButton();
}

main();