chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action == "download") {
        if (message.ext == "mp3") {
            //downloadTest();
        }
        else if (message.ext == "ogg"){

        }
        else if (message.ext == "webm") {
            //console.log(chrome.downloads.download({url:"https://themesmoeaudio.sfo2.digitaloceanspaces.com/themes/41457/ED1.mp3", filename:"test.mp3", saveAs:true})); //https://animethemes.moe/video/86-ED1-NCBD1080.webm
        }
    }
})

function downloadTest() {
    import(chrome.runtime.getURL("../script/FileSaver.js")).then((module) => {
        module.saveAs("https://themesmoeaudio.sfo2.digitaloceanspaces.com/themes/41457/ED1.mp3", "test.mp3", { autoBom: true });
    });
}

// TODO: Save raw files in the matching format to opfs (chrome and firefox support) OR save as blob (in RAM)
// TODO: Add metadata to files if requested
// TODO: Save files to user fs as zip to avoid multiple popups