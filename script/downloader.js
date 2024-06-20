//TODO: download of whole list

export function startDownload(dl_opt) {
    console.log(dl_opt);

    let table_anime = document.getElementsByTagName("app-anime-list-table").item(0).firstElementChild;
    if (!table_anime)
        table_anime = document.getElementsByTagName("table").item(0);
    let links = Array.from(table_anime.getElementsByTagName("a")).filter((a) => a.href.endsWith(".webm"));
    links.forEach((a, index, arr) => arr[index] = a.href);
    
    if (dl_opt.file_ext == "webm") 
        downloadWEBMs(links);
    else if (dl_opt.file_ext == "mp3") {
        links.forEach((webm_link, index, arr) => arr[index] = getMP3Address(webm_link));
        downloadMP3s(links, dl_opt.embed_metadata, dl_opt.metadata_type);
    }
    else if (dl_opt.file_ext == "ogg") {
        links.forEach((webm_link, index, arr) => arr[index] = getOGGAddress(webm_link));
        downloadOGGs(links, dl_opt.embed_metadata, dl_opt.metadata_type);
    }
}

/**
 * Downloads videos in webm format.
 * @param {Array} links - Links to download.
 */
function downloadWEBMs(links) {
    
}
/**
 * Downloads music in mp3 format with or without metadata.
 * @param {Array} links - Links to download.
 * @param {boolean} embed_metadata - Whether or not to embed metadata.
 * @param {string} metadata_type - Type of metadata embedding.
 */
function downloadMP3s(links, embed_metadata, metadata_type) {

}
/**
 * Downloads music in ogg format with or without metadata.
 * @param {Array} links - Links to download.
 * @param {boolean} embed_metadata - Whether or not to embed metadata.
 * @param {string} metadata_type - Type of metadata embedding. Is ignored if embed_metadata is false
 */
function downloadOGGs(links, embed_metadata, metadata_type) {

}
/**
 * Find an equavalant mp3 link to a webm link.
 * @param {string} link - Link in webm format to find an equivalent link to.
 * @returns {string} Equivalent mp3 link.
 */
function getMP3Address(link) {

}
/**
 * Find an equavalant ogg link to a webm link.
 * @param {string} link - Link in webm format to find an equivalent link to.
 * @returns {string} Equivalent ogg link.
 */
function getOGGAddress(link) {

}