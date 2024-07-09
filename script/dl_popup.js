var max_range_end = 0;
var download_running = false;

export function attachToPopup() {
    let rdio_audio = document.getElementById("rdio-audio");
    let rdio_video = document.getElementById("rdio-video");
    if (rdio_audio.checked)
        applyAudioMode();
    else if (rdio_video.checked)
        applyVideoMode();
    
    document.getElementById("popup-flexbox").addEventListener("click", event => closePopup(event));
    document.getElementById("cancel-btn").addEventListener("click", event => closePopup(event));
    document.getElementById("apply-btn").addEventListener("click", event => onClickDownloadBtn(event));
    
    rdio_audio.addEventListener("change", () => applyAudioMode());
    rdio_video.addEventListener("change", () => applyVideoMode());
    document.getElementById("sel-ext").addEventListener("change", () => updateSelExt());
    document.getElementById("chk-mul-ver").addEventListener("change", () => calculateRangeEnd());
    document.getElementById("chk-range").addEventListener("change", event => {
        let range_start = document.getElementById("input-range-start");
        let range_end = document.getElementById("input-range-end");
        if (event.target.checked) {
            range_start.disabled = false;
            range_end.disabled = false;
        }
        else {
            range_start.disabled = true;
            range_end.disabled = true;
            range_start.value = 1;
            range_end.value = max_range_end;
        }
    });

    calculateRangeEnd();
    let labels = Array.from(document.getElementById("popup-content").getElementsByTagName("label"));
    labels.forEach(label => swapMarginPadding(label));
}

function closePopup(event) {
    if (!event ||
        event.currentTarget == event.explicitOriginalTarget && 
        (!download_running || event.currentTarget.id != "popup-flexbox")) {
        if (download_running)
            if (confirm("Do you really want to cancel the list download?"))
                window.location.reload();
        document.getElementById("popup-container")?.remove();
    }
}
function onClickDownloadBtn(event) {
    let download_opt = {};
    download_opt.embed_metadata = document.getElementById("chk-metadata").checked;
    download_opt.file_ext = document.getElementById("sel-ext").value;
    download_opt.include_multiple_ver = document.getElementById("chk-mul-ver").checked;
    let chk_range = document.getElementById("chk-range")
    if (chk_range.checked) {
        let range_start = document.getElementById("input-range-start");
        let start = parseInt(range_start.value, 10);
        if (Number.isNaN(start) || start < 1) {
            range_start.value = 1;
            start = 1;
        }
        download_opt.range_start = start;
        let range_end = document.getElementById("input-range-end");
        let end = parseInt(range_end.value, 10);
        if (Number.isNaN(end) || end > max_range_end) {
            range_end.value = max_range_end;
            end = max_range_end;
        }
        download_opt.range_end = end;
    }
    
    let popup_window = document.getElementById("popup-window");
    let input_elems = getElementsByTagNames(["input", "select", "button"], popup_window);
    input_elems = input_elems.filter(elem => elem != document.getElementById("cancel-btn"));
    input_elems.forEach(input_elem => fullDisableElem(input_elem));

    import(getInternalURL("../script/themes_downloader.js")).then(async module => { 
        download_running = true;
        event.target.textContent = "Downloading";
        if (document.fonts.check("1em fa-solid-900")) {
            let loading_symbol = document.createElement("i");
            loading_symbol.className = "fa fa-fw fa-spinner fa-pulse";
            event.target.appendChild(loading_symbol);
        }
        else
            txt.textContent += "...";
        await module.startDownload(window.location.href, download_opt);
        event.target.textContent = "Done";
        download_running = false;
        for (let i = 2; i > 0; i--) {
            console.info("closing in " + i + " " + (i == 1 ? "second" : "seconds"))
            await new Promise((res) => setTimeout(res, 1000));
        }
        console.info("closing...")
        closePopup();
    });
}
function applyVideoMode() {
    fullDisableElem(document.getElementById("chk-metadata"));
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
}
function updateSelExt() {
    let sel_ext = document.getElementById("sel-ext");
    if (sel_ext.value == "mp3")
        fullEnableElem(document.getElementById("chk-metadata"));
    else
        fullDisableElem(document.getElementById("chk-metadata"));
}
function calculateRangeEnd() {
    let count = 0;

    let table_anime = document.getElementsByTagName("app-anime-list-table").item(0).firstElementChild;
    if (!table_anime)
        table_anime = document.getElementsByTagName("table").item(0);
    let rows = Array.from(table_anime.getElementsByTagName("tr"))
    rows.forEach(row => {
        Array.from(row.getElementsByTagName("a")).filter(a => a.href.endsWith(".webm")). // include only anchors with .webm at the end of their links
        forEach((a, index, arr) => {
            for (let i = index + 1; i < arr.length; i++) {
                if (a.href == arr[i].href) {
                    arr.splice(i, 1);
                    i--;
                    continue;
                }
                if (!document.getElementById("chk-mul-ver").checked) {
                    let space_a = a.text.indexOf(" ");
                    if (arr[i].text.startsWith(a.text.substring(0, space_a != -1 ? space_a : undefined))) { // check if they are the same opening but different versions and exclude.
                        arr.splice(i, 1);
                        i--;
                    }
                }
            }
            count++;
        });
    }); 
    document.getElementById("input-range-start").max = count;
    let range_end = document.getElementById("input-range-end");
    range_end.max = count;
    range_end.value = count;
    max_range_end = count;
}
/**
 * Gets all elements with the matching tag names similar to getElementsByTagName but for multiple tags.
 * @param {String[]} qualifiedNames - Qualified name of each tag to be searched.
 * @param {Element | Document} [scopeElement=document] - Element to search the tags in. Defaults to the whole document.
 * @returns {Element[]} A array of all Element with the matching tag names.
 */
function getElementsByTagNames(qualifiedNames, scopeElement = document) {
    if (!scopeElement)
        scopeElement = document;
    let arr = [];
    qualifiedNames.forEach(qualifiedName =>
        arr = arr.concat(Array.from(scopeElement.getElementsByTagName(qualifiedName))));
    return arr;
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