export function attachToPopup() {
    updateSelMetadataType();
    if (document.getElementById("rdio-video").checked)
        applyAudioMode();
    if (document.getElementById("rdio-video").checked)
        applyVideoMode();
    
    document.getElementById("popup-flexbox").addEventListener("click", event => closePopup(event));
    document.getElementById("cancel-btn").addEventListener("click", event => closePopup(event));
    document.getElementById("apply-btn").addEventListener("click", event => onClickDownloadBtn(event));

    let rdio_audio = document.getElementById("rdio-audio");
    let rdio_video = document.getElementById("rdio-video");
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
    import(getInternalURL("../script/downloader.js")).then((module) => { 
    });
    closePopup(event);
}
function applyVideoMode() {
    fullDisableElem(document.getElementById("chk-metadata"));
    fullDisableElem(document.getElementById("sel-metadata-type"));
    let sel_ext = document.getElementById("sel-ext");
    fullDisableElem(sel_ext);
    while (sel_ext.firstChild)
        sel_ext.removeChild(sel_ext.firstChild);
    let opt_mp4 = document.createElement("option");
    opt_mp4.value = "mp4";
    opt_mp4.text = "mp4"
    sel_ext.append(opt_mp4);
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
function fullDisableElem(elem) {
    elem.disabled = true;
    if (elem.tagName.toLowerCase() == "select")
        elem.className = elem.className.replace("clickable", "").trim().replace(new RegExp("\s{2,}", "gi"), " ");
    else
        elem.parentElement.className = elem.parentElement.className.replace("clickable", "").trim().replace(new RegExp("\s{2,}", "gi"), " ");
}
function fullEnableElem(elem) {
    elem.disabled = false;
    if (elem.tagName.toLowerCase() == "select")
        elem.className = elem.className.concat(" ", "clickable").trim();
    else
        elem.parentElement.className = elem.parentElement.className.concat(" ", "clickable").trim();
}