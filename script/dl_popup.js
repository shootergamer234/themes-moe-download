export function attachToPopup() {
    updateSelMetadataType();
    let rdio_audio = document.getElementById("rdio-audio");
    let rdio_video = document.getElementById("rdio-video");
    if (rdio_audio.checked)
        applyAudioMode();
    else if (rdio_video.checked)
        applyVideoMode();
    
    document.getElementById("popup-flexbox").addEventListener("click", event => closePopup(event));
    document.getElementById("cancel-btn").addEventListener("click", event => closePopup(event));
    document.getElementById("apply-btn").addEventListener("click", event => onClickDownloadBtn(event));
    
    let chk_metadata = document.getElementById("chk-metadata");
    let sel_ext = document.getElementById("sel-ext");
    rdio_audio.addEventListener("change", () => applyAudioMode());
    rdio_video.addEventListener("change", () => applyVideoMode());
    chk_metadata.addEventListener("change", () => updateSelMetadataType());
    sel_ext.addEventListener("change", () => updateSelExt())

    swapMarginPadding(rdio_audio.nextSibling);
    swapMarginPadding(rdio_video.nextSibling);
    swapMarginPadding(chk_metadata.nextSibling);
}

function closePopup(event) {
    if (!event || event.currentTarget == event.explicitOriginalTarget)
        document.getElementById("popup-container").remove();
}
function onClickDownloadBtn(event) {
    let download_opt = {};
    download_opt.mode = document.getElementById("rdio-audio").checked ? "audio" : document.getElementById("rdio-video").checked ? "video" : "";
    download_opt.embed_metadata = document.getElementById("chk-metadata").checked;
    download_opt.metadata_type = download_opt.embed_metadata ? document.getElementById("sel-metadata-type").value : "";
    download_opt.file_ext = document.getElementById("sel-ext").value;
    
    let popup_window = document.getElementById("popup-window");
    let input_elems = Array.from(popup_window.getElementsByTagName("input")).concat(Array.from(popup_window.getElementsByTagName("select")));
    input_elems.forEach( input_elem => fullDisableElem(input_elem));

    import(getInternalURL("../script/downloader.js")).then((module) => { 
        module.startDownload(download_opt);
    });
    event.target.textContent = "Downloading..."; //TODO: add loading wheel
}
function applyVideoMode() {
    fullDisableElem(document.getElementById("chk-metadata"));
    fullDisableElem(document.getElementById("sel-metadata-type"));
    let sel_ext = document.getElementById("sel-ext");
    fullDisableElem(sel_ext);
    while (sel_ext.firstChild)
        sel_ext.removeChild(sel_ext.firstChild);
    sel_ext.append(createSimpleOption("webm"));
}
function applyAudioMode() {
    fullEnableElem(document.getElementById("chk-metadata"));
    
    let sel_ext = document.getElementById("sel-ext");
    fullEnableElem(sel_ext);
    while (sel_ext.firstChild)
        sel_ext.removeChild(sel_ext.firstChild);
    sel_ext.append(createSimpleOption("mp3"));
    sel_ext.append(createSimpleOption("ogg"));
    updateSelMetadataType();
}
function updateSelMetadataType() {
    let sel_metadata_type = document.getElementById("sel-metadata-type")
    if (document.getElementById("chk-metadata").checked)
        fullEnableElem(sel_metadata_type);
    else
        fullDisableElem(sel_metadata_type);
}
function updateSelExt() {
    let sel_ext = document.getElementById("sel-ext");
    if (sel_ext.value == "mp3") {
        fullEnableElem(document.getElementById("chk-metadata"));
        fullEnableElem(document.getElementById("sel-metadata-type"));
    }
    else {
        fullDisableElem(document.getElementById("chk-metadata"));
        fullDisableElem(document.getElementById("sel-metadata-type"));
    }
}
/**
 * Disables a HTMLElement and removes the clickable class of itself or its parent element.
 * @param {HTMLElement} elem - HTMLElement to fully disable.
 */
function fullDisableElem(elem) {
    elem.disabled = true;
    if (elem.tagName.toLowerCase() == "select")
        removeClass(elem, "clickable");
    else
        removeClass(elem.parentElement, "clickable");
}
/**
 * Enables a HTMLElement and appends the clickable class to itself or its parent element.
 * @param {HTMLElement} elem - HTMLElement to fully enable.
 */
function fullEnableElem(elem) {
    elem.disabled = false;
    if (elem.tagName.toLowerCase() == "select")
        appendClass(elem, "clickable");
    else
        appendClass(elem.parentElement, "clickable");
}
/**
 * Removes one className from the classNames of the given HTMLElement.
 * @param {HTMLElement} elem - HTMLElement from which to remove the class.
 * @param {string} className - className to be removed.
 */
function removeClass(elem, className) {
    elem.className = elem.className.replace(className, "").trim().replace("  ", " ");
}
/**
 * Appends one className from the classNames of the given HTMLElement.
 * @param {HTMLElement} elem - HTMLElement to which to append the class.
 * @param {string} className - className to be appended.
 */
function appendClass(elem, className) {
    elem.className = elem.className.concat(" ", className).trimStart();
}
/**
 * Swaps the margin and the padding of a HTMLElement.
 * @param {HTMLElement} elem - HTMLElement to swap Margin and Padding.
 * @param {Window} v_window - Window object dictating the current margin to be replaced. Default is the defaultView of the current document.
 */
function swapMarginPadding(elem, v_window = document.defaultView) {
    let temp_margin = v_window.getComputedStyle(elem).margin;
    elem.style.margin = "0px 0px 0px 0px";
    elem.style.padding = temp_margin;
}
/**
 * Creates a option element with the text and value being the same.
 * @param {string} text - Text and value of the option.
 * @returns {HTMLOptionElement} The option element with text and value set to the text parameter.
 */
function createSimpleOption(text) {
    let opt = document.createElement("option");
    opt.value = text;
    opt.text = text;
    return opt;
}