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
    rdio_audio.addEventListener("change", () => applyAudioMode());
    rdio_video.addEventListener("change", () => applyVideoMode());
    chk_metadata.addEventListener("change", () => updateSelMetadataType());

    let v_window = document.defaultView;
    let label_audio = rdio_audio.nextSibling;
    let temp_audio = v_window.getComputedStyle(label_audio).margin;
    label_audio.style.margin = "0px 0px 0px 0px";
    label_audio.style.padding = temp_audio;
    let label_video = rdio_video.nextSibling;
    let temp_video = v_window.getComputedStyle(label_video).margin;
    label_video.style.margin = "0px 0px 0px 0px";
    label_video.style.padding = temp_video;
    let label_metadata = chk_metadata.nextSibling;
    let temp_metadata = v_window.getComputedStyle(label_metadata).margin;
    label_metadata.style.margin = "0px 0px 0px 0px";
    label_metadata.style.padding = temp_metadata;
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
    //TODO: add loading wheel
}
function applyVideoMode() {
    fullDisableElem(document.getElementById("chk-metadata"));
    fullDisableElem(document.getElementById("sel-metadata-type"));
    let sel_ext = document.getElementById("sel-ext");
    fullDisableElem(sel_ext);
    while (sel_ext.firstChild)
        sel_ext.removeChild(sel_ext.firstChild);
    let opt_webm = document.createElement("option");
    opt_webm.value = "webm";
    opt_webm.text = "webm"
    sel_ext.append(opt_webm);
}
function applyAudioMode() {
    fullEnableElem(document.getElementById("chk-metadata"));
    
    let sel_ext = document.getElementById("sel-ext");
    fullEnableElem(sel_ext);
    while (sel_ext.firstChild)
        sel_ext.removeChild(sel_ext.firstChild);
    let opt_mp3 = document.createElement("option");
    opt_mp3.value = "mp3";
    opt_mp3.text = "mp3";
    sel_ext.append(opt_mp3);
    let opt_ogg = document.createElement("option");
    opt_ogg.value = "ogg";
    opt_ogg.text = "ogg";
    sel_ext.append(opt_ogg);
    updateSelMetadataType();
}
function updateSelMetadataType() {
    let sel_metadata_type = document.getElementById("sel-metadata-type")
    if (document.getElementById("chk-metadata").checked)
        fullEnableElem(sel_metadata_type);
    else
        fullDisableElem(sel_metadata_type);
}
/**
 * Disables a HTMLElement and removes the clickable class of itself or its parrent Element
 * @param {HTMLElement} elem - HTMLElement to fully disable
 */
function fullDisableElem(elem) {
    elem.disabled = true;
    if (elem.tagName.toLowerCase() == "select")
        removeClass(elem, "clickable");
    else
        removeClass(elem.parentElement, "clickable");
}
/**
 * Enables a HTMLElement and appends the clickable class to itself or its parrent Element
 * @param {HTMLElement} elem - HTMLElement to fully enable
 */
function fullEnableElem(elem) {
    elem.disabled = false;
    if (elem.tagName.toLowerCase() == "select")
        appendClass(elem, "clickable");
    else
        appendClass(elem.parentElement, "clickable");
}
/**
 * Removes one className from the classNames of the given HTMLElement
 * @param {HTMLElement} elem - HTMLElement from which to remove the class
 * @param {string} className - className to be removed
 */
function removeClass(elem, className) {
    elem.className = elem.className.replace(className, "").trim().replace("  ", " ");
}
/**
 * Appends one className from the classNames of the given HTMLElement
 * @param {HTMLElement} elem - HTMLElement to which to append the class
 * @param {string} className - className to be appended
 */
function appendClass(elem, className) {
    elem.className = elem.className.concat(" ", className).trimStart();
}