// @ts-check

/**
 * Options for the themes.moe list download.
 * @typedef {object} dl_opt
 * @property {string} [dl_opt.file_ext] - File extension of the downloaded files. Defaults to "mp3".
 * @property {boolean} [dl_opt.embed_metadata] - Whether or not to embed metadata. Defaults to false.
 * @property {string} [dl_opt.metadata_type] - Type of metadata embedding. Supported values are "simple" and "advanced". Defaults to undefined or "advanced" if dl_opt.embed_metadata is true.
 * @property {boolean} [dl_opt.include_multiple_ver] - Whether or not to include multiple versions of a opening. Defaults to false. // TODO: html implementation
 * @property {number} [dl_opt.range_start] - First item to download. Defaults to 1 representing the beginning of the list.
 * @property {number} [dl_opt.range_end] - Last item to download. Defaults to Infinity representing the end of the list.
 */
/**
 * Anime in the themes.moe API.
 * @typedef {object} Anime
 * @property {number} malID
 * @property {string} name
 * @property {number} year
 * @property {string} season
 * @property {Theme[]} themes
 */
/**
 * Theme in the themes.moe API.
 * @typedef {object} Theme
 * @property {string} themeType
 * @property {string} themeName
 * @property {Mirror} mirror
 */
/**
 * Download mirror in the themes.moe API.
 * @typedef {object} Mirror
 * @property {string} mirrorURL
 * @property {number} priority
 * @property {string} notes
 */

/**
 * Downloads themes.moe list in webm, ogg or mp3 format with or without metadata. (Metadata currently only supported for mp3)
 * @param {string} url - URL of the themes.moe list to download.
 * @param {dl_opt} dl_opt - Options for the themes.moe list download.
 * @property {string} [dl_opt.file_ext] - File extension of the downloaded files. Defaults to "mp3".
 * @property {boolean} [dl_opt.embed_metadata] - Whether or not to embed metadata. Defaults to false.
 * @property {string} [dl_opt.metadata_type] - Type of metadata embedding. Supported values are "simple" and "advanced". Defaults to undefined or "advanced" if dl_opt.embed_metadata is true.
 * @property {boolean} [dl_opt.include_multiple_ver] - Whether or not to include multiple versions of a opening. Defaults to false.
 * @property {number} [dl_opt.range_start] - First item to download. Defaults to 1 representing the beginning of the list.
 * @property {number} [dl_opt.range_end] - Last item to download. Defaults to Infinity representing the end of the list.
*/
export async function startDownload(url, dl_opt) { 
    //#region normalizing parameters
    if (!url.match(new RegExp("^https?://.+$", "i")))
        throw new Error("url is not in an URL format: \"^https?://.+$\"")
    if (!url.match(new RegExp("^https?://themes.moe/list/.+/.+$", "i")))
        throw new Error("url is not an URL to a themes.moe list")
    if (url.endsWith("/"))
        url = url.slice(0, url.length-1);
    if (!dl_opt || typeof dl_opt != "object")
        dl_opt = {};
    if (!dl_opt.file_ext || typeof dl_opt.file_ext != "string")
        dl_opt.file_ext = "mp3";
    else
        dl_opt.file_ext.toLowerCase();
    if (dl_opt.file_ext != "mp3" && dl_opt.file_ext != "ogg" && dl_opt.file_ext != "webm" ) {
        console.warn(dl_opt.file_ext + "is not a supported file extension switching to mp3");
        dl_opt.file_ext = "mp3";
    }
    if (!dl_opt.embed_metadata)
        dl_opt.embed_metadata = false;
    if (!dl_opt.metadata_type)
        if (dl_opt.embed_metadata) 
            dl_opt.metadata_type = "advanced";
        else 
            dl_opt.metadata_type = undefined;
    if (dl_opt.file_ext != "mp3") { 
        dl_opt.embed_metadata = false; // embedding of everything else than mp3 not supported
        dl_opt.metadata_type = undefined;
    }
    if (!dl_opt.include_multiple_ver || typeof dl_opt.include_multiple_ver != "boolean")
        dl_opt.include_multiple_ver = false
    if (!dl_opt.range_start || typeof dl_opt.range_start != "number")
        dl_opt.range_start = 1
    if (!dl_opt.range_end || typeof dl_opt.range_end != "number")
        dl_opt.range_end = Infinity
    //#endregion
    /** @type {Anime[]} */
    let list_json = await getJSONobj(getThemesMoeAPIListURL(url));
    
    // @ts-ignore
    let zip = new JSZip();
    let title = isThemesMoePlaylist(url) ? await getThemesMoePlaylistName(url) : getFilenameFromURL(url, false);
    let pl = zip.folder(title ? title : "playlist");
    let fail_count = 0;
    let song_count = 0;
    let song_progress = 0;
    
    list_json.forEach((anime) => {
        anime.themes.forEach((theme, /** @type {number} */ index, arr) => {
            let url = theme.mirror.mirrorURL;
            let unver_theme_type = "";
            for (let i = index + 1; i < arr.length; i++) {
                if (url == arr[i].mirror.mirrorURL) {
                    arr.splice(i, 1);
                    i--;
                }
                if (!dl_opt.include_multiple_ver) {
                    if (!unver_theme_type)
                        unver_theme_type = theme.themeType.substring(0, theme.themeType.indexOf(" "))
                    if (unver_theme_type == "") {
                        console.warn("themeType for version differentiating couldn't be detected. Final file might include multiple versions.")
                        continue;
                    }
                    if (arr[i].themeType.startsWith(unver_theme_type)) {
                        arr.splice(i, 1);
                        i--;
                    }
                }
            }
            song_count++;
        })});

    list_json.forEach((anime) => {
        anime.themes.forEach(async (theme, /** @type {number} */ index, arr) => {
            let song_json;
            if (dl_opt.file_ext == "ogg" || dl_opt.embed_metadata)
                song_json = await getJSONobj(getAniThemesAPIVidURL(url, dl_opt.file_ext, dl_opt.embed_metadata));

            if (dl_opt.file_ext == "ogg")
                url = song_json.video.audio.link;
            else if (dl_opt.file_ext == "mp3")
                url = await getMP3Address(anime.malID, theme.themeType, url);

            // @ts-ignore
            JSZipUtils.getBinaryContent(url, (error, data) => {
                console.log((song_progress/song_count*100).toFixed(2)+"%" + " : downloading " + anime.name + " " + theme.themeType);
                if (error) {
                    fail_count++;
                    throw error;
                }

                if (dl_opt.embed_metadata && dl_opt.file_ext == "mp3") {} // TODO: embedding of metadata
                pl.file(
                    anime.name + " " + (dl_opt.include_multiple_ver ? theme.themeType : theme.themeType.replace(new RegExp(" V\\d+$", "i"), "")) + "." + dl_opt.file_ext, 
                    data, 
                    { base64: true }); 
                song_progress++
                
                if (song_count == song_progress+fail_count) {
                    console.info("zipping...")
                    // @ts-ignore
                    zip.generateAsync({type:"blob"}).then((content) => saveAs(content, title ? title : "playlist"+".zip"));
                    console.info("finished downloading " + title);
                }
            });
        })
    })
    if (fail_count > 0) 
        console.warn(fail_count + " Downloads failed");
}

/**
 * Find an equavalant mp3 link to a webm link.
 * @param {!string | !number} mal_id - MyAnimeList ID to the anime linked to the opening.
 * @param {!string} theme_type - Type of theme according to themes.moe.
 * @param {?string | undefined} url - URL in webm format to find an equivalent link to. Seems to be optional but is recommended.
 * @returns {Promise<string>} Equivalent mp3 link.
 */
async function getMP3Address(mal_id, theme_type, url) {
    if (!mal_id)
        throw new Error("mal_id has a invalid value");
    if (!theme_type)
        throw new Error("theme_type has a invalid value");
    return fetch("https://themes.moe/api/themes/" + mal_id +"/" + theme_type + "/audio", { method: "POST", body: url ? url : undefined })
        .then((response)=> response.text())
        .then((responseText)=> { return responseText; });
}
/**
 * Transforms a themes.moe list URL into an API list URL.
 * @param {!string} url - URL to the themes.moe list.
 * @returns {string} URL to the API containing list data.
 */
function getThemesMoeAPIListURL(url) {
    let api_url = "https://themes.moe/api";
    let new_url = url.replace(new RegExp("^https?://themes\\.moe/list", "i"), api_url);
    if (new_url.substring(api_url.length).startsWith("/playlist/"))
        new_url += new_url.endsWith("/") ? "" : "/" + "anime";
    return new_url;
}
/**
 * Transforms a animethemes.moe video URL into an API video URL with the matching resource inclusion.
 * @param {!string} url - URL to the webm video on animethemes.moe.
 * @param {?string | undefined} file_ext - File extentsion of the download. Includes "audio" if set to "ogg".
 * @param {?boolean | undefined} embed_metadata - Whether or not to embed_metadata in the download. Includes "animethemeentries.animetheme.song.artists" for metadata if set to true.
 * @returns {string} URL to the API containing video data.
 */
function getAniThemesAPIVidURL(url, file_ext, embed_metadata) {
    let new_url = url.replace(new RegExp("^https?://(animethemes\\.moe/video|v\\.animethemes\\.moe)", "i"), "https://api.animethemes.moe/video");
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
/**
 * Fetches the url and returns the value of the response.json() method;
 * @param {!string} url - URL containing the json to fetch.
 * @returns {Promise<any>} A matching object to json data returned by response.json().
 */
async function getJSONobj(url) {
    return fetch(url)
        .then((response)=> response.json())
        .then((responseJson)=> { return responseJson; });
}
/**
 * Removes the path and if rm_file_ext is true the file extension to retrieve the name of the file and replaces dashes with spaces.
 * @param {!string} url - URL to extract the filename off.
 * @param {?boolean | undefined} rm_file_ext - Whether to or not remove the file extensions like ".txt" or ".pdf".
 * @returns {string | undefined} the filename or undefined if url is null or not a string.
 */
function getFilenameFromURL(url, rm_file_ext){
    if (!url || typeof url != "string")
        return undefined;
    let period_index = url.lastIndexOf(".");
    let filename = url.substring(url.lastIndexOf("/") + 1, rm_file_ext ? period_index != -1 ? period_index : undefined : undefined);
    return filename.replace(new RegExp("-", "g"), " ");
}
/**
 * Check if the url is a themes.moe plalist url.
 * @param {!string} url - URL to be checked.
 * @returns {boolean} Whether or not the url is a themes.moe playlist url.
 */
function isThemesMoePlaylist(url) {
    if (!url || typeof url != "string")
        return false
    return Boolean(url.match(new RegExp("https?://themes.moe/list/playlist")));
}
/**
 * Retrieves the name of a playlist from themes.moe.
 * @param {!string} url - URL to the playlist.
 * @returns {Promise<string>} Name of the playlist.
 */
async function getThemesMoePlaylistName(url) {
    return (await getJSONobj(getThemesMoeAPIListURL(url).replace(new RegExp("anime$", "i"), "name"))).playlistName;
}