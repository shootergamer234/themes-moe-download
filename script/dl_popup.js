export function attachToPopup() {
    if (document.getElementById("rdio-video").checked)
        applyAudioMode();
    if (document.getElementById("rdio-video").checked)
        applyVideoMode();
    
    document.getElementById("popup-flexbox").addEventListener("click", event => closePopup(event));
    document.getElementById("cancel-btn").addEventListener("click", event => closePopup(event));
    document.getElementById("apply-btn").addEventListener("click", event => onClickDownloadBtn(event));

    let rdio_audio = document.getElementById("rdio-audio");
    let rdio_video = document.getElementById("rdio-video");
    rdio_audio.addEventListener("change", () => applyAudioMode());
    rdio_video.addEventListener("change", () => applyVideoMode());

    let v_window = document.defaultView;
    let label_audio = rdio_audio.nextSibling;
    let temp_audio = v_window.getComputedStyle(label_audio).margin;
    label_audio.style.margin = "0px 0px 0px 0px";
    label_audio.style.padding = temp_audio;
    let label_video = rdio_video.nextSibling;
    let temp_video = v_window.getComputedStyle(label_video).margin;
    label_video.style.margin = "0px 0px 0px 0px";
    label_video.style.padding = temp_video;
    let label_metadata = document.getElementById("chk-metadata").nextSibling;
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
    let chk_metadata = document.getElementById("chk-metadata");
    chk_metadata.disabled = true;
    chk_metadata.parentElement.className = chk_metadata.parentElement.className.replace("clickable", "");
    let sel_metadata_type = document.getElementById("sel-metadata-type");
    sel_metadata_type.disabled = true;
    sel_metadata_type.className = sel_metadata_type.className.replace("clickable", "");
    let sel_ext = document.getElementById("sel-ext");
    sel_ext.disabled = true;
    sel_ext.className = sel_ext.className.replace("clickable", "");
    while (sel_ext.firstChild)
        sel_ext.removeChild(sel_ext.firstChild);
    let opt_mp4 = document.createElement("option");
    opt_mp4.value = "mp4";
    opt_mp4.text = "mp4"
    sel_ext.append(opt_mp4);
}
function applyAudioMode() {
    let chk_metadata = document.getElementById("chk-metadata");
    chk_metadata.disabled = false;
    let chk_metadata_par_class = chk_metadata.parentElement.className;
    chk_metadata.parentElement.className = chk_metadata_par_class.concat(" ", "clickable");
    let sel_metadata_type = document.getElementById("sel-metadata-type");
    sel_metadata_type.disabled = false;
    let sel_metadata_type_class = sel_metadata_type.className;
    sel_metadata_type.className = sel_metadata_type_class.concat(" ", "clickable");
    let sel_ext = document.getElementById("sel-ext");
    sel_ext.disabled = false;
    let sel_ext_class = sel_ext.className;
    sel_ext.className = sel_ext.className.concat(" ", "clickable");
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
}