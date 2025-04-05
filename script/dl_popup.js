var max_range_end = 0;
var download_running = false;
var html_log_first = true;
/** @type {HTMLDivElement} */
var filter_controls;
/** @type {HTMLDivElement} */
var warning_back;
/** @type {HTMLDivElement} */
var warning_log;
/** @type {HTMLDivElement} */
var warning_box;
/** @type {HTMLParagraphElement} */
var log_textbox;

/**
 * Attaches the events and methods of the dl_popup.js to the dl_popup.
 * @param {?HTMLElement} list_controls - The controls on the themes.moe list for filtering
 */
export function attachToPopup(list_controls) {
    if (list_controls)
        for (let elem of list_controls.getElementsByTagName("button"))
            if (elem.textContent.match(new RegExp("^\\s*filters\\s*$", "i"))){
                filter_controls = elem.nextElementSibling;
                break;
            }
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
    let range_start = document.getElementById("input-range-start");
    let range_end = document.getElementById("input-range-end");
    document.getElementById("chk-range").addEventListener("change", event => {
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
    setInputFilter(range_start, value => /^([1-9]\d*)?$/.test(value));
    setInputFilter(range_end, value => /^([1-9]\d*)?$/.test(value));

    calculateRangeEnd(); // TODO: make range work from outside of themes.moe?
}

function closePopup(event) {
    if (!event ||
        event.currentTarget == event.target &&
        (!download_running || event.currentTarget.id != "popup-flexbox")) {
        if (download_running)
            if (confirm("Do you really want to cancel the list download?"))
                window.location.reload();
        document.getElementById("popup-container")?.remove();
        html_log_first = true;
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

    initHTMLLog();
    import(getInternalURL("../script/themes_downloader.js")).then(async module => { 
        if (filter_controls) {
            download_opt.filter = [];
            if (isFilterApplied("Include Currently Watching")) download_opt.filter.push(module.filter_type.watching);
            if (isFilterApplied("Include Completed")) download_opt.filter.push(module.filter_type.completed);
            if (isFilterApplied("Include On-hold")) download_opt.filter.push(module.filter_type.on_hold);
            if (isFilterApplied("Include Dropped")) download_opt.filter.push(module.filter_type.dropped);
            if (isFilterApplied("Include PTW")) download_opt.filter.push(module.filter_type.plan_to_watch);
            download_opt.include_op = isFilterApplied("Include OP");
            download_opt.include_ed = isFilterApplied("Include ED");
        }
        download_running = true;
        event.target.title = "";
        event.target.textContent = "Downloading";
        if (document.fonts.check("1em fa-solid-900")) {
            let loading_symbol = document.createElement("i");
            loading_symbol.className = "fa fa-fw fa-spinner fa-pulse";
            event.target.appendChild(loading_symbol);
        }
        else
            txt.textContent += "...";
        await module.startDownload(window.location.href, download_opt, HTMLLog); // modify this if you want to start the list download from your own website
        event.target.textContent = "Done"; //FIXME: shown when not done
        document.getElementById("cancel-btn").textContent = "Close";
        download_running = false;
    });
}
function applyVideoMode() {
    fullDisableElem(document.getElementById("chk-metadata"));
    let sel_ext = document.getElementById("sel-ext");
    fullDisableElem(sel_ext);
    while (sel_ext.firstChild)
        sel_ext.removeChild(sel_ext.firstChild);
    sel_ext.append(createSimpleOption("webm"));
    sel_ext.title = "webm: The only video format offered by animethemes.moe. If a mp4 file is necessary use a converter like for example ffmpeg.";
}
function applyAudioMode() {
    fullEnableElem(document.getElementById("chk-metadata"));
    
    let sel_ext = document.getElementById("sel-ext");
    fullEnableElem(sel_ext);
    while (sel_ext.firstChild)
        sel_ext.removeChild(sel_ext.firstChild);
    sel_ext.append(createSimpleOption("mp3"));
    sel_ext.append(createSimpleOption("ogg"));
    sel_ext.title = "mp3: The smallest audio file extension offered directly by themes.moe. Use this if you want metadata embedded as ID3v2.4.\n" + 
        "ogg: slightly better quality but larger than mp3. Use this if you want the best sound quality and don't need metadata to be embedded";
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
 * Checks if a specific themes.moe list filter is applied
 * @param {string} filter - Name of the filter. This is Case Sensitive.
 * @returns {boolean} state of the searched filter or false if filter_controls wasn't assigned or the filter option doesn't exist.
 */
function isFilterApplied(filter) {
    if (!filter_controls)
        return false;
    for (let elem of filter_controls.children)
        if (elem.textContent.match(new RegExp("\\s*" + filter + "\\s*", "")))
            return elem.children.item(0).className.includes("fa-check");
    return false;
}
/**
 * @callback inputFilter
 * @param {string} value - the new value trying to be set.
 * @returns {boolean} If truthy the input is accepted.
 */
/**
 * Applies a filter to a HTMLInputElement so only the requested inputs are accepted.
 * @param {HTMLInputElement} textbox - Textbox that should only contain filtered values.
 * @param {inputFilter} inputFilter - Callback function that applies the new value only if true is returned.
 */
function setInputFilter(textbox, inputFilter) {
    ["input", "keydown", "keyup", "mousedown", "mouseup", "select", "contextmenu", "drop"].forEach(event => {
        textbox.addEventListener(event, function () {
            let selectionSupport = ["password", "search", "tel", "text", "url"].includes(this.type);
            if (inputFilter(this.value) && (this.value.length == 0 ||
                (!this.min || this.min && parseInt(this.value) >= parseInt(this.min)) &&
                (!this.max || this.max && parseInt(this.value) <= parseInt(this.max)))) {
                this.oldValue = this.value;
                if (selectionSupport) {
                    this.oldSelectionStart = this.selectionStart;
                    this.oldSelectionEnd = this.selectionEnd;
                }
            }
            else if (this.hasOwnProperty("oldValue")) {
                this.value = this.oldValue;
                if (selectionSupport)
                    this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
            }
            else
                this.value = "";
        });
    });
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
        elem.classList.remove("clickable");
    else
        elem.parentElement.classList.remove("clickable");
}
/**
 * Enables a HTMLElement and appends the clickable class to itself or its parent element.
 * @param {HTMLElement} elem - HTMLElement to fully enable.
 */
function fullEnableElem(elem) {
    elem.disabled = false;
    if (elem.tagName.toLowerCase() == "select")
        if (!elem.classList.contains("clickable"))
            elem.classList.add("clickable");
    else
        if (!elem.parentElement.classList.contains("clickable"))
            elem.parentElement.classList.add("clickable");
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
 * Creates an option element with the text and value being the same.
 * @param {string} text - Text and value of the option.
 * @returns {HTMLOptionElement} The option element with text and value set to the text parameter.
 */
function createSimpleOption(text) {
    let opt = document.createElement("option");
    opt.value = text;
    opt.text = text;
    return opt;
}
function initHTMLLog() {
    warning_back = document.getElementById("warning-back");
    warning_box = document.getElementById("warning-box");
    warning_log = document.getElementById("warning-log");
    log_textbox = document.getElementById("log-textbox");
    
    warning_box.addEventListener("click", () => toggleHTMLLog());
    document.getElementById("popup-window").addEventListener("click", event => {
        if (warning_log.contains(event.target) || warning_box.contains(event.target) || warning_back.contains(event.target))
            return;
        hideHTMLLog();
    });
    warning_box.parentElement.hidden = false;
}
function isHTMLLogCollapsed() { 
    return warning_log.classList.contains("collapsed");
}
function toggleHTMLLog() {
    if (isHTMLLogCollapsed())
        showHTMLLog()
    else
        hideHTMLLog()
}
function showHTMLLog() {
    warning_log.scroll(0, warning_log.scrollHeight);
    warning_log.style.transform = "translateY(" + (-warning_box.offsetHeight) + "px)"; // TODO: Use precise method for translating or workaround
    warning_back.style.transform = "translateY(" + (-warning_box.offsetHeight) + "px)";
    warning_box.querySelector(".log-caret").classList.remove("log-caret-collapsed");
    warning_log.classList.remove("collapsed");
    warning_back.classList.remove("collapsed");
}
/**
 * Log to the HTMLLog
 * @param {string} text
 * @param {number} verbosity
 */
function HTMLLog(text, verbosity) {
    if (html_log_first) {
        clearHTMLLog();
        html_log_first = false;
    }
    
    log_textbox.textContent = text;
    let div = document.createElement("div");
    import(getInternalURL("../script/themes_downloader.js")).then(async module => {
        switch (verbosity) {
            case module.verbosity_level.info:
                changeWarningBoxType("log-log");
                /*div.className = "log log-log row-box"; //only show latest info; do not log info
                div.innerHTML = '<i class="fa fa-fw fa-info-circle i-info"></i>' + text;
                warning_log.appendChild(div);*/
                console.info(text);
                break;
            case module.verbosity_level.warning:
                changeWarningBoxType("log-warning");
                div.className = "log log-warning row-box";
                div.innerHTML = '<i class="fa fa-fw fa-exclamation-circle"></i>' + text;
                warning_log.appendChild(div);
                console.warn(text);
                break;
            case module.verbosity_level.error:
                changeWarningBoxType("log-error");
                div.className = "log log-error row-box";
                div.innerHTML = '<i class="fa fa-fw fa-exclamation-triangle"></i>' + text;
                warning_log.appendChild(div);
                console.error(text);
                break;
        }
    });
}
function clearHTMLLog() {
    warning_log.innerHTML = "";
    log_textbox.textContent = "";
}
/**
 * Changes the type of warning of the warning box changing its design
 * @param {string} newType 
 */
function changeWarningBoxType(newType) {
    warning_box.classList.remove("log-log");
    warning_box.classList.remove("log-warning");
    warning_box.classList.remove("log-error");
    warning_box.classList.add(newType);
}
function hideHTMLLog() {
    warning_box.querySelector(".log-caret").classList.add("log-caret-collapsed");
    warning_log.classList.add("collapsed");
    warning_back.classList.add("collapsed");
}