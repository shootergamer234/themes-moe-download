// @ts-check

var global_log_callback;

export const filter_type = {
    watching: 1,
    completed: 2,
    on_hold: 3,
    dropped: 4,
    plan_to_watch: 6
}

export const verbosity_level = {
    //critical: 0
    error: 1,
    warning: 2,
    info: 3
    //,debug: 4
}

//#region ts types
/**
 * Options for the themes.moe list download.
 * @typedef {object} dl_opt
 * @property {string} [dl_opt.file_ext] - File extension of the downloaded files. Defaults to "mp3".
 * @property {boolean} [dl_opt.embed_metadata] - Whether or not to embed metadata. Defaults to false.
 * @property {number[]} [dl_opt.filter] - Array of applicable themes.moe filter types. Defaults to all. An empty or filter type devoid array causes the method to return without downloading.
 * @property {boolean} [dl_opt.include_op] - Whether or not to include openings. Defaults to true. If this and dl_opt.include_ed are false the method returns without downloading.
 * @property {boolean} [dl_opt.include_ed] - Whether or not to include endings. Defaults to true. If this and dl_opt.include_op are false the method returns without downloading.
 * @property {boolean} [dl_opt.include_multiple_ver] - Whether or not to include multiple versions of a opening. Defaults to false.
 * @property {number} [dl_opt.range_start] - First item to download. Defaults to 1 representing the beginning of the list if undefined or out of range.
 * @property {number} [dl_opt.range_end] - Last item to download. Defaults to Infinity representing the end of the list if undefined or out of range.
 */
/**
 * Anime object in the themes.moe API.
 * @typedef {object} ThemesMoeAnime
 * @property {number} malID
 * @property {string} name
 * @property {number} year
 * @property {string} season
 * @property {Theme[]} themes
 * @property {number} [watchStatus]
 */
/**
 * Theme object in the themes.moe API.
 * @typedef {object} Theme
 * @property {string} themeType
 * @property {string} themeName
 * @property {Mirror} mirror
 */
/**
 * Download mirror object in the themes.moe API.
 * @typedef {object} Mirror
 * @property {string} mirrorURL
 * @property {number} priority
 * @property {string} notes
 */
/**
 * Video json object returned by response.json() when connecting using animethemes.moe API
 * @typedef {object} VideoJsonObj
 * @property {Video} video
 */
/**
 * Video object in the animethemes.moe API (not all Attributes included)
 * @typedef {object} Video
 * @property {!number} id
 * @property {!string} link
 * @property {!string} filename
 * @property {!string} [mimetype]
 * @property {Audio} [audio]
 * @property {AnimeThemeEntry[]} [animethemeentries]
 */
/**
 * Audio object in the animethemes.moe API (not all Attributes included)
 * @typedef {object} Audio
 * @property {!number} id
 * @property {!string} filename
 * @property {!string} link
 * @property {!string} [mimetype]
 */
/**
 * Anime Theme Entry object in the animethemes.moe API (not all Attributes included)
 * @typedef {object} AnimeThemeEntry
 * @property {!number} id
 * @property {?string} episodes
 * @property {?number} version
 * @property {AnimeTheme} [animetheme]
 */
/**
 * Anime Theme object in the animethemes.moe API (not all Attributes included)
 * @typedef {object} AnimeTheme
 * @property {!number} id
 * @property {!string} slug
 * @property {Song} [song]
 */
/**
 * Song object in the animethemes.moe API (not all Attributes included)
 * @typedef {object} Song
 * @property {!number} id
 * @property {?string} title
 * @property {Artist[]} [artists]
 */
/**
 * Artist object in the animethemes.moe API (not all Attributes included)
 * @typedef {object} Artist
 * @property {!number} id
 * @property {!string} name
 * @property {!string} slug
 */
/**
 * @callback LogCallback
 * @param {string} text - the text to log.
 * @param {number} verbosity - number indicating the verbosity. Verbosity levels can be found in the "verbosity_level" Object.
 */
//#endregion

/**
 * Downloads themes.moe list in webm, ogg or mp3 format with or without metadata. (Metadata currently only supported for mp3)
 * @param {string} url - URL of the themes.moe list to download.
 * @param {?dl_opt} dl_opt - Options for the themes.moe list download.
 * @property {string} [dl_opt.file_ext] - File extension of the downloaded files. Defaults to "mp3".
 * @property {boolean} [dl_opt.embed_metadata] - Whether or not to embed metadata. Defaults to false.
 * @property {number[]} [dl_opt.filter] - Array of applicable themes.moe filter types. Only works with MyAnimeList. Defaults to all. An empty or filter type devoid array causes the method to return without downloading.
 * @property {boolean} [dl_opt.include_op] - Whether or not to include openings. Defaults to true. If this and dl_opt.include_ed are false the method returns without downloading.
 * @property {boolean} [dl_opt.include_ed] - Whether or not to include endings. Defaults to true. If this and dl_opt.include_op are false the method returns without downloading.
 * @property {boolean} [dl_opt.include_multiple_ver] - Whether or not to include multiple versions of a opening. Defaults to false.
 * @property {number} [dl_opt.range_start] - First item to download. Defaults to 1 representing the beginning of the list if undefined or out of range.
 * @property {number} [dl_opt.range_end] - Last item to download. Defaults to Infinity representing the end of the list if undefined or out of range.
 * @param {?LogCallback} log_callback 
*/
export async function startDownload(url, dl_opt, log_callback) { 
    if (log_callback)
        global_log_callback = log_callback;
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
        logOrDefault(dl_opt.file_ext + "is not a supported file extension switching to mp3", verbosity_level.warning);
        dl_opt.file_ext = "mp3";
    }
    if (dl_opt.file_ext != "mp3")
        dl_opt.embed_metadata = false; // embedding of everything else than mp3 not supported
    if (!dl_opt.filter || !Array.isArray(dl_opt.filter))
        dl_opt.filter = Object.values(filter_type);
    else {
        dl_opt.filter.filter((value) => typeof value == "number" && Object.values(filter_type).includes(value))
        dl_opt.filter.sort();
    }
    if (!dl_opt.include_op || typeof dl_opt.include_op != "boolean")
        dl_opt.include_op = true;
    if (!dl_opt.include_ed || typeof dl_opt.include_ed != "boolean")
        dl_opt.include_ed = true;
    if (!dl_opt.include_multiple_ver || typeof dl_opt.include_multiple_ver != "boolean")
        dl_opt.include_multiple_ver = false;
    if (!dl_opt.range_start || typeof dl_opt.range_start != "number" || dl_opt.range_start < 1)
        dl_opt.range_start = 1;
    if (!dl_opt.range_end || typeof dl_opt.range_end != "number")
        dl_opt.range_end = Infinity;
    if (dl_opt.range_end < dl_opt.range_start) {
        let temp = dl_opt.range_start;
        dl_opt.range_start = dl_opt.range_end;
        dl_opt.range_end = temp;
    }
    //#endregion
    if (!dl_opt.include_op && !dl_opt.include_ed || dl_opt.filter.length == 0)
        return; // nice nothing to do
    /** @type {ThemesMoeAnime[]} */
    let list_json = await getJSONobj(getThemesMoeAPIListURL(url));
    
    // @ts-ignore
    let zip = new JSZip();
    let title = isThemesMoePlaylist(url) ? await getThemesMoePlaylistName(url) : getFilenameFromURL(url, false);
    let pl = zip.folder(title ? title : "playlist");
    let fail_count = 0;
    let song_count = 0;
    let song_progress = 0;
    
    list_json.forEach(anime => {
        anime.themes.forEach((theme, index, arr) => {
            let unver_theme_type = "";
            if (!dl_opt.include_multiple_ver) {
                let space_index = theme.themeType.indexOf(" ");
                unver_theme_type = theme.themeType.substring(0, space_index != -1 ? space_index : undefined);
            }
            for (let i = index + 1; i < arr.length; i++) {
                if (theme.mirror.mirrorURL == arr[i].mirror.mirrorURL) {
                    arr.splice(i, 1);
                    i--;
                    continue;
                }
                if (!dl_opt.include_multiple_ver) {
                    if (unver_theme_type == "")
                        logOrDefault("themeType for version differentiating couldn't be detected. Final file might include multiple versions of " + anime.name + " " + theme.themeType, verbosity_level.warning);
                    if (arr[i].themeType.startsWith(unver_theme_type)) {
                        arr.splice(i, 1);
                        i--;
                    }
                }
            }
            song_count++;
        })
    });

    let skip_count = 0;
    let temp_song_count = 0;
    list_json.forEach(anime => {
        for (let i = 0; i < anime.themes.length; i++) {
            temp_song_count++;
            if (dl_opt.range_start && skip_count < dl_opt.range_start-1 || 
                dl_opt.range_end && temp_song_count > dl_opt.range_end) {
                anime.themes.splice(i, 1);
                i--;
                skip_count++;
                continue;
            }
        }
    });
    if (!isThemesMoePlaylist(url))
        // @ts-ignore
        list_json = list_json.filter((anime) => dl_opt.filter.includes(anime.watchStatus));
    if (dl_opt.range_end != Infinity)
        song_count = dl_opt.range_end - dl_opt.range_start + 1;
    
    list_json.forEach(anime => {
        anime.themes.forEach(async (theme, index, arr) => {
            let theme_url = theme.mirror.mirrorURL;
            /** @type {?VideoJsonObj | undefined} */
            let video_json;
            if (dl_opt.file_ext == "ogg" || dl_opt.embed_metadata) {
                video_json = await getJSONobj(getAniThemesAPIVidURL(theme_url, dl_opt.file_ext, dl_opt.embed_metadata));
                if (!video_json) {
                    logOrDefault("Error downloading " + anime.name + " " + theme.themeType + ": couldn't get theme data from animethemes.moe", verbosity_level.error);
                    fail_count++;
                    return;
                }
            }

            if (video_json && dl_opt.file_ext == "ogg") {
                if (!video_json.video.audio) {
                    logOrDefault("Error downloading " + anime.name + " " + theme.themeType + ": couldn't get audio link(ogg) from animethemes.moe", verbosity_level.error);
                    fail_count++;
                    return;
                }
                theme_url = video_json.video.audio.link;
            }
            else if (dl_opt.file_ext == "mp3")
                theme_url = await getMP3Address(anime.malID, theme.themeType, url);

            // @ts-ignore
            JSZipUtils.getBinaryContent(theme_url, (/** @type {Error} */ error, /** @type {ArrayBuffer} */ data) => {
                logOrDefault((song_progress/song_count*100).toFixed(1)+"%" + " : downloading " + anime.name + " " + theme.themeType, verbosity_level.info);
                if (error) {
                    fail_count++;
                    logOrDefault("Skipping metadata embedding: " + error.message, verbosity_level.warning);
                }
                if (dl_opt.embed_metadata && dl_opt.file_ext == "mp3")
                    if (video_json && video_json.video.animethemeentries) {
                        try {
                            data = embed_theme_metadata(data, video_json.video.animethemeentries, anime, theme, dl_opt);
                        }
                        catch (error) {
                            if (error.message == "theme_entries is empty")
                                logOrDefault("Skipping metadata embedding: No Entry for " + anime.name + " " + theme.themeType + " found", verbosity_level.warning)
                            else if (error.message == "animetheme is undefined")
                                logOrDefault("Skipping metadata embedding: animetheme of " + anime.name + " " + theme.themeType + " were not included", verbosity_level.warning);
                            else if (error.message.startsWith("MP3Tag: "))
                                logOrDefault("Skipping metadata embedding: " + error.message, verbosity_level.warning);
                            else
                                throw error;
                        }
                    }
                    else
                        logOrDefault("Skipping metadata embedding: animethemeentries of " + anime.name + " " + theme.themeType + " were not included", verbosity_level.warning);
                
                pl.file(
                    anime.name + " " + (dl_opt.include_multiple_ver ? theme.themeType : theme.themeType.replace(new RegExp(" V\\d+$", "i"), "")) + "." + dl_opt.file_ext, 
                    data, { base64: true }); 
                song_progress++
                
                if (song_count == song_progress+fail_count) {
                    logOrDefault("zipping...", verbosity_level.info)
                    // @ts-ignore
                    zip.generateAsync({type:"blob"}).then(content => saveAs(content, title ? title : "playlist"+".zip"));
                    logOrDefault("finished downloading " + title, verbosity_level.info);
                }
            });
        });
    });
    if (fail_count > 0) 
        logOrDefault(fail_count + " Downloads failed Zip might not contain all files", verbosity_level.warning);
}

/**
 * Logs with the given logCallback if provided. Defaults to console logging if not provided.
 * @param {string} text 
 * @param {number} verbosity 
 */
function logOrDefault(text, verbosity) {
    if (global_log_callback)
        global_log_callback(text, verbosity)
    else {
        switch (verbosity) {
            case verbosity_level.warning:
                console.warn(text);
                break;
            case verbosity_level.error:
                console.error(text);
                break;
            default:
                console.info(text);
        }
    }
}

/**
 * Embeds metadata of an AnimeTheme to file buffer. Writes title, artists, genre and comment.
 * @param {ArrayBuffer} buffer - Buffer of the file. (only mp3 supported)
 * @param {AnimeThemeEntry[]} theme_entries - Array of theme_entries with the metadata being in the song attribute of a AnimeTheme.
 * @param {ThemesMoeAnime} anime - Anime object in the themes.moe API.
 * @param {Theme} theme - Theme object in the themes.moe API.
 * @param {dl_opt} dl_opt - Options for the themes.moe list download.
 * @returns {ArrayBuffer} Buffer of the file embedded with metadata.
 * @throws Throws an error if theme_entries is invalid or embedding fails otherwise.
 */
function embed_theme_metadata(buffer, theme_entries, anime, theme, dl_opt) {
    if (!theme_entries || !Array.isArray(theme_entries))
        throw TypeError("theme_entries is not a valid Array");
    if (theme_entries.length == 0)
        throw Error("theme_entries is empty");
    if (theme_entries.length > 1)
        logOrDefault("multiple theme entries found applying first entry", verbosity_level.warning);
    if (!theme_entries[0].animetheme)
        throw Error("animetheme is undefined");
    let song = theme_entries[0].animetheme.song;
    if (!song)
        throw Error("Song is undefined");

    return embed_mp3_metadata(buffer, song.title, song.artists, "Anime Music", 
        anime.name + " " + (dl_opt.include_multiple_ver ? theme.themeType : theme.themeType.replace(new RegExp(" V\\d+$", "i"), "")) + "\n"
        + "downloaded from themes.moe with themes_downloader");
}
/**
 * Embeds metadata to mp3 buffer. Writes title, artists, genre and comment.
 * @param {ArrayBuffer} buffer - Buffer of the mp3 file.
 * @param {?string | undefined} title - Title to be added as ID3v2 Tag.
 * @param {?Artist[] | undefined} artists - Artists to be added as ID3v2 Tag.
 * @param {?string | undefined} genre - Genre to be added as ID3v2 Tag.
 * @param {?string | undefined} description - Description to be added as ID3v2 Tag. May contain newlines.
 * @returns {ArrayBuffer} Buffer of the mp3 file embedded with metadata.
 * @throws Throws an error if embedding fails in MP3Tag.
 */
function embed_mp3_metadata(buffer, title, artists, genre, description) {
    // @ts-ignore
    let mp3tag = new MP3Tag(buffer);
    if (mp3tag.error !== '')
        throw new Error("MP3Tag: " + mp3tag.error);
    mp3tag.read();
    if (mp3tag.error !== '')
        throw new Error("MP3Tag: " + mp3tag.error);
    mp3tag.tags.title = title ? title : undefined;
    mp3tag.tags.artist = artists ? getCombinedArtistString(artists) : undefined;
    mp3tag.tags.genre = genre;
    mp3tag.tags.v2.COMM = description ? [{
        language: "eng",
        descriptor: "",
        text: description
        }] : undefined;
    // TODO: attach picture? mp3tag.tags.v2.APIC
    buffer = mp3tag.save({ strict: true });
    if (mp3tag.error !== '')
        throw new Error("MP3Tag: " + mp3tag.error);
    return buffer;
}
/**
 * Find an equivalent mp3 link to a webm link.
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
 * @param {?string | undefined} file_ext - File extension of the download. Includes "audio" if set to "ogg".
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
 * Combines a list of artists into the the typical format "artist1 feat. artist2, artist3".
 * @param {Artist[]} artists - Array of artists with a name attribute.
 * @returns {string} String containing all artists in the typical format.
 */
function getCombinedArtistString(artists){
    if (!artists || !Array.isArray(artists))
        throw TypeError("Artists is not a valid Array")
    return artists.reduce((acc, artist, index) => {
        let name = artist.name;
        return index == 0 ? acc + name : index == 1 ? acc + " feat. " + name : acc + ", " + name;
    }, "");
}
/**
 * Fetches the url and returns the value of the response.json() method;
 * @param {!string} url - URL containing the json to fetch.
 * @returns {Promise<any>} A matching object to json data returned by response.json().
 */
async function getJSONobj(url) {
    for (let tries = 0; tries < 3; tries++) {
        let resp = await fetch(url);
        if (resp.status == 429) {
            let retry_after = resp.headers.get("retry-after");
            let time_ms;
            if (retry_after)
                time_ms = getRetryAfterMs(retry_after);
            else
                time_ms = 20000;
            logOrDefault("Too many requests on " + getAddressFromURL(url) + " waiting for " + time_ms + "ms", verbosity_level.warning);
            await delay(time_ms);
            continue;
        }
        return await resp.json();
    }
    throw Error("Download failed due to too many requests. Retry later");
}
/**
 * Creates a promise that resolves after the set time.
 * @param {number} time_ms - time in milliseconds.
 * @returns {Promise} promise for awaiting.
 */
function delay(time_ms) {
    return new Promise(resolve => setTimeout(resolve, time_ms))
}
/**
 * Parses the "Retry-After" header supplied with HTTP error 429 for example.
 * @param {!string} retryHeaderString - String provided as value for the "Retry-After" Header.
 * @returns {number} The time indicated by the "Retry-After" Header in milliseconds.
 */
function getRetryAfterMs(retryHeaderString) {
    let time_ms = Math.round(parseFloat(retryHeaderString) * 1000);
    if (Number.isNaN(time_ms)) {
      time_ms = Math.max(0, Date.parse(retryHeaderString) - Date.now());
    }
    return time_ms;
}
/**
 * Removes protocol and path to retrieve the address of a http or https url.
 * @param {!string} url - URL to extract the address off.
 * @returns {string} the address of the URL.
 */
function getAddressFromURL(url) {
    if (!url || typeof url != "string" || !url.match("^https?://"))
        return "";
    let addr_begin = url.indexOf("//") + 2
    let slash_index = url.indexOf("/", addr_begin);
    return url.substring(addr_begin, slash_index != -1 ? slash_index : undefined);
}
/**
 * Removes the path and if rm_file_ext is true the file extension to retrieve the name of the file and replaces dashes with spaces.
 * @param {!string} url - URL to extract the filename off.
 * @param {?boolean | undefined} rm_file_ext - Whether to or not remove the file extensions like ".txt" or ".pdf".
 * @returns {string} the filename with or without file extension.
 */
function getFilenameFromURL(url, rm_file_ext){
    if (!url || typeof url != "string")
        return "";
    let period_index = url.lastIndexOf(".");
    let filename = url.substring(url.lastIndexOf("/") + 1, rm_file_ext ? period_index != -1 ? period_index : undefined : undefined);
    return filename.replace(new RegExp("-", "g"), " ");
}
/**
 * Check if the url is a themes.moe playlist url.
 * @param {!string} url - URL to be checked.
 * @returns {boolean} Whether or not the url is a themes.moe playlist url.
 */
function isThemesMoePlaylist(url) {
    if (!url || typeof url != "string")
        return false
    return Boolean(url.match(new RegExp("^https?://themes.moe/list/playlist")));
}
/**
 * Retrieves the name of a playlist from themes.moe.
 * @param {!string} url - URL to the playlist.
 * @returns {Promise<string>} Name of the playlist.
 */
async function getThemesMoePlaylistName(url) {
    return (await getJSONobj(getThemesMoeAPIListURL(url).replace(new RegExp("anime$", "i"), "name"))).playlistName;
}