//TODO: download of whole list

export async function startDownload(dl_opt) { 
    if (dl_opt.file_ext != "mp3") { // normalizing options
        dl_opt.embed_metadata = false; // embedding of everything else than mp3 not supported
        dl_opt.metadata_type = undefined;
    }

    // let table_anime = document.getElementsByTagName("app-anime-list-table").item(0).firstElementChild;
    // if (!table_anime)
    //     table_anime = document.getElementsByTagName("table").item(0);
    // let links = Array.from(table_anime.getElementsByTagName("a")) // Search for HTMLAnchorElements in the anime table
    //     .filter((a) => a.href.endsWith(".webm")); // Filter out HTMLAnchorElements that don't link to a video
    // links.forEach((a, index, arr) => arr[index] = a.href); // Get respective link of HTMLAnchorElement
    // links = Array.from(new Set(links)); // Filter double inputs
    
    let list_json = await getJSONobj(getThemesMoeListURL(window.location.href));
    
    
    let zip = new JSZip();
    let title = document.getElementsByTagName("h1").item(0).textContent // TODO: account for access from somewhere else than themes.moe
    let pl = zip.folder(title ? title : "playlist");
    let fail_count = 0;
    let song_count = 0;
    let song_progress = 0;

    list_json.forEach((anime) => {
        anime.themes.forEach(async (theme) => {
            song_count++;
            let link = theme.mirror.mirrorURL;
            let song_json;
            if (dl_opt.file_ext == "ogg" || dl_opt.embed_metadata)
                song_json = await getJSONobj(getAniThemesApiVidURL(link, dl_opt.file_ext, dl_opt.embed_metadata));
            // TODO: exclude double values => lesser fetches

            if (dl_opt.file_ext == "ogg")
                link = song_json.video.audio.link;
            else if (dl_opt.file_ext == "mp3")
                link = await getMP3Address(link, anime.malID, theme.themeType);

            JSZipUtils.getBinaryContent(link, (error, data) => {
                console.log((song_progress / song_count * 100).toFixed(2)+"%" + " : downloading " + anime.name + " " + theme.themeType);
                console.log(data);
                if (error) {
                    fail_count++;
                    throw error;
                }

                if (dl_opt.embed_metadata && dl_opt.file_ext == "mp3") {} // TODO: embedding of metadata
                pl.file(getFilenameFromURL(theme.mirror.mirrorURL) + "." + dl_opt.file_ext, // TODO: name from json
                    data, { base64: true });
                song_progress++
                
                if (song_count == song_progress+fail_count) {
                    console.log("finished downloading " + title);
                    zip.generateAsync({type:"blob"})
                        .then((content) => saveAs(content, title ? title : "playlist"+".zip"));}
            });
        })
    })
    if (fail_count > 0) console.warn(fail_count + " Downloads failed");
    // links.forEach(async function(link, index, arr) { 
    //     let song_json;
    //     if (dl_opt.file_ext == "ogg" || dl_opt.embed_metadata)
    //         song_json = await getJSONobj(getAniThemesApiVideoLink(link, dl_opt.file_ext, dl_opt.embed_metadata));

    //     //TODO: transform url for mp3
    //     if (dl_opt.file_ext == "ogg")
    //         link = song_json.video.audio.link;

    //     JSZipUtils.getBinaryContent(link, (error, data) => {
    //         console.log(index);
    //         if (error) throw error
            
    //         if (dl_opt.embed_metadata) {} // TODO: embedding of metadata
    //         pl.file(
    //             getFilenameFromURL(arr[index]) + "." + dl_opt.file_ext, 
    //             data, { base64: true });
    //         if (arr.length == index+1)
    //             zip.generateAsync({type:"blob"})
    //                 .then((content) => saveAs(content, title ? title : "playlist"+".zip"));
    //     });
    // });

    //console.log(await (await fetch("https://api.animethemes.moe/video/FateStayNightUBWS2-OP1.webm?include=audio,animethemeentries.animetheme.song.artists")).json());

    // if (dl_opt.file_ext == "webm") 
    //     downloadWEBMs(links);
    // else if (dl_opt.file_ext == "mp3") {
    //     links.forEach((webm_link, index, arr) => arr[index] = getMP3Address(webm_link));
    //     downloadMP3s(links, dl_opt.embed_metadata, dl_opt.metadata_type);
    // }
    // else if (dl_opt.file_ext == "ogg") {
    //     links.forEach((webm_link, index, arr) => arr[index] = getOGGAddress(webm_link));
    //     downloadOGGs(links, dl_opt.embed_metadata, dl_opt.metadata_type);
    // }
}

/**
 * Builds a download message that can be send to background.js for downloading through the sendMessage() method.
 * @param {string} ext - The expected extension of the download.
 * @param {string} embed_metadata - Whether or not to embed metadata.
 * @param {string} metadata_type - Type of metadata embedding. Is ignored if embed_metadata is false.
 * @param {string} links - Links to download.
 * @returns {object} Message object containing the download information.
 */
const createDlMessage = (ext, embed_metadata, metadata_type, links) => {
    return { 
        action: "download", 
        title: document.getElementsByTagName("h1").item(0).textContent,
        ext: ext, 
        embed_metadata: 
        embed_metadata, 
        metadata_type: metadata_type,
        links: links
    };
}

/**
 * Downloads videos in webm format.
 * @param {Array} links - Links to download.
 */
async function downloadWEBMs(links) { // TODO: rework dltypes
    let zip = new JSZip(); // TODO: downloads.download on >30 vids
    let title = document.getElementsByTagName("h1").item(0).textContent // TODO: move somewhere else
    let pl = zip.folder(title ? title : "playlist");
    let file_count = 0;
    links.forEach(async function(link) { 
        JSZipUtils.getBinaryContent(link, (error, data) => {
            console.log(file_count);

            pl.file(file_count+".webm", data, { base64: true });
            file_count++;
            if (links.length == file_count)
                zip.generateAsync({type:"blob"})
                    .then((content) => saveAs(content, title ? title : "playlist"+".zip"));
        });
    });

    // JSZipUtils.getBinaryContent(links[0], (error, data) => {
    //     console.log(file_count);

    //     pl.file(file_count+".webm", data, { base64: true });
    //     file_count++;
    //     zip.generateAsync({type:"blob"})
    //         .then((content) => saveAs(content, title ? title : "playlist"+".zip"));
    // });


    chrome.runtime.sendMessage(createDlMessage("webm"));
}
/**
 * Downloads music in mp3 format with or without metadata.
 * @param {Array} links - Links to download.
 * @param {boolean} embed_metadata - Whether or not to embed metadata.
 * @param {string} metadata_type - Type of metadata embedding.
*/
async function downloadMP3s(links, embed_metadata, metadata_type) {
    /*let a = document.createElement("a");
    a.download = "test.mp3";
    a.href = "https://themesmoeaudio.sfo2.digitaloceanspaces.com/themes/41457/ED1.mp3";
    a.click();*/

    import(chrome.runtime.getURL("../script/client_zip.js")).then(async function(module) {
        let song_blob_arr = new Array();
        links.forEach(async function(link, index) { 
            song_blob_arr[index] = await fetch(link);
            //TODO: add metadata
        });
        let blob = await module.downloadZip([data]).blob();
        console.log(blob);

        let anchor_invis = document.createElement("a");
        let url_blob = URL.createObjectURL(blob);
        anchor_invis.href = url_blob;
        anchor_invis.download = "test.zip";
        anchor_invis.click();
        URL.revokeObjectURL(url_blob);
        anchor_invis.remove()
    });
    chrome.runtime.sendMessage(createDlMessage("mp3", embed_metadata, metadata_type));
}
/**
 * Downloads music in ogg format without metadata.
 * @param {Array} links - Links to download.
 * @param {boolean} embed_metadata - Whether or not to embed metadata.
 * @param {string} metadata_type - Type of metadata embedding. Is ignored if embed_metadata is false.
 */
function downloadOGGs(links, embed_metadata, metadata_type) {
    chrome.runtime.sendMessage(createDlMessage("ogg", embed_metadata, metadata_type));
}
/**
 * Find an equavalant mp3 link to a webm link.
 * @param {string} link - Link in webm format to find an equivalent link to.
 * @returns {string} Equivalent mp3 link.
 */
async function getMP3Address(url, mal_id, theme_type) {
    if (!mal_id)
        throw new Error("mal_id has a invalid value");
    if (!theme_type)
        throw new Error("theme_type has a invalid value");
    return fetch("https://themes.moe/api/themes/" + mal_id +"/" + theme_type + "/audio", { method: "POST", body: url ? url : undefined })
        .then((response)=> response.text())
        .then((responseText)=> { return responseText; });
}
/**
 * Find an equavalant ogg link to a webm link.
 * @param {string} link - Link in webm format to find an equivalent link to.
 * @returns {string} Equivalent ogg link.
 */
function getOGGAddress(link) {

}

function getThemesMoeListURL(url) {
    let api_url = "https://themes\.moe/api";
    let new_url = url.replace(new RegExp("^https?://themes\.moe/list", "i"), api_url);
    if (new_url.substring(api_url.length).startsWith("/playlist/"))
        new_url += new_url.endsWith("/") ? "" : "/" + "anime";
    return new_url;
}

function getAniThemesApiVidURL(url, file_ext, embed_metadata) {
    let new_url = url.replace(new RegExp("^https?://(animethemes\.moe/video|v.animethemes.moe)", "i"), "https://api.animethemes.moe/video");
    if (file_ext != "ogg" && !embed_metadata)
        return new_url;
    new_url += "?include=";
    if (file_ext == "ogg")
        new_url += "audio";
    if (embed_metadata)
        if (file_ext == "ogg")
            new_url += ",animethemeentries.animetheme.song.artists";
        else
            new_url += "animethemeentries.animetheme.song.artists";
    return new_url;
}

async function getJSONobj(url) {
    return fetch(url)
        .then((response)=> response.json())
        .then((responseJson)=> { return responseJson; });
}

function getFilenameFromURL(url){
    let filename = url.substring(url.lastIndexOf("/")+1, url.lastIndexOf("."));
    filename = filename.replace(new RegExp("-\D(nc)?\w+\d{3,}$", "i"), "");
    return filename.replace(new RegExp("-", "g"), " ");
}