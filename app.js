console.info('🔥', 'code2img v1.0');
const API_ENDPOINT = 'https://code2img.vercel.app';
const FILE_EXTENSION = "png";
const FILENAME_PREFIX = "code2img";
const PARENT_ID = 'code2img-parent';
const themes = [
    "a11y-dark",
    "atom-dark",
    "base16-ateliersulphurpool.light",
    "cb",
    "darcula",
    "default",
    "dracula",
    "duotone-dark",
    "duotone-earth",
    "duotone-forest",
    "duotone-light",
    "duotone-sea",
    "duotone-space",
    "ghcolors",
    "hopscotch",
    "material-dark",
    "material-light",
    "material-oceanic",
    "nord",
    "pojoaque",
    "shades-of-purple",
    "synthwave84",
    "vs",
    "vsc-dark-plus",
    "xonokai"
];
const languages = [
    "c",
    "css",
    "cpp",
    "go",
    "html",
    "java",
    "javascript",
    "python",
    "rust",
    "typescript"
];

function getTimestamp() {
    const now = new Date();
    return [...now.toDateString().split(" ").splice(1), now.toTimeString().substring(0, 8).split(':').join('')].join('_');
}

/**
 * @param {string} newText 
 */
function updateOverlayText(newText) {
    chrome.tabs.executeScript({
        code: `(() => {
            let overlayText = document.getElementById('Code2Image-Loading-Overlay-Text');
            if (overlayText) { 
                overlayText.textContent = "${newText}"; 
            }
        })();`,
    });
}

function clearOverlay() {
    chrome.tabs.executeScript({
        code: `(() => {
            let overlayView = document.getElementById('Code2Image-Loading-Overlay');
            if (overlayView) { 
                document.body.removeChild(overlayView);
            }
        })();`,
    });
}

chrome.contextMenus.create({
    title: 'Code2Image',
    contexts: ['selection'],
    id: PARENT_ID
}, () => {
    languages.forEach(language => {
        const languageMenuItemId = `${PARENT_ID}_${language}`; 
        chrome.contextMenus.create({
            title: language,
            parentId: PARENT_ID,
            id: languageMenuItemId,
            contexts: ['selection'],
        }, () => {
            themes.forEach(theme => {
                let themeMenuItemId = `${languageMenuItemId}_${theme}`;
                chrome.contextMenus.create({
                    title: theme,
                    parentId: languageMenuItemId,
                    id: themeMenuItemId,
                    contexts: ['selection'],
                    onclick: (event, tab) => {
                        handleClick(event, tab, language, theme);
                    }
                });
            });
        });
    });
});

/**
* 
* @param {chrome.contextMenus.OnClickData} event
* @param {chrome.tabs.Tab} tab
* @param {string} selectedLanguage
* @param {string} selectedTheme
*/
function handleClick(event, tab, selectedLanguage, selectedTheme) {
    // event.selectionText does not preserve line breaks :(
    chrome.tabs.executeScript({
        code: "window.getSelection().toString();"
    }, (selection) => {    
        const selectedText = selection[0];
        console.info('🔥', `Selected Language: ${selectedLanguage}`);
        
        let queryParams = new URLSearchParams();
        queryParams.set('language', selectedLanguage);
        queryParams.set('theme', selectedTheme);
        queryParams.set('background-color', 'radial-gradient(circle, rgba(63,94,251,1) 0%, rgba(252,70,107,1) 100%)');

        // create overlay
        chrome.tabs.executeScript({
            file: 'create-overlay.js',
        });
        
        let requestUrl = `${API_ENDPOINT}/api/to-image?${queryParams.toString()}`;
        let request = new XMLHttpRequest();
        request.responseType = 'blob';
        request.addEventListener("progress", (progressEvent) => {
            if (progressEvent.lengthComputable) {
                let percentLoaded = ((progressEvent.loaded / progressEvent.total) * 100).toFixed(0);
                updateOverlayText(`Generating Image (${percentLoaded}%), please wait`);
            }
        });
        request.addEventListener("load", function () {
            let durationMs = 1500;
            if (this.status === 200) {
                console.info('✅', 'code2img request successful');
                console.info('🛠', `Response Type: ${this.responseType}`);
                if (this.responseType === 'blob') {
                    console.info('🛠', 'Generating Image URL');
                    const imageBlobUrl = window.URL.createObjectURL(this.response);
                    console.info('🛠', `Image blob URL: ${imageBlobUrl}`);
                    
                    let downloadFileName = `${FILENAME_PREFIX}_${getTimestamp()}.${FILE_EXTENSION}`;
                    console.info('🛠', `Download filename: '${downloadFileName}'`);
                    
                    chrome.downloads.download({
                        url: imageBlobUrl,
                        saveAs: true,
                        filename: downloadFileName,
                    });
                } else {
                    console.info('🤷‍♂️', 'Unknown response, ignored');
                }
                console.info('✅', 'Operation Complete');
                durationMs = 0;
            } else {
                updateOverlayText("Sorry, something went wrong 🤷‍♂️");
                console.warn('❌', `code2img: Request failed`);
            }
            setTimeout(() => {
                clearOverlay();
            }, durationMs);
        });
        request.open("POST", requestUrl);
        request.send(selectedText);
    }) 
}