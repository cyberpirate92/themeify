/**
 * @typedef {Object} UserPreferences
 * @property {string} backgroundColor
 * @property {string} showBackground
 * @property {string} backgroundImage
 * @property {string} showLineNumbers
 * @property {number} backgroundPadding
 */


const API_ENDPOINT = 'https://code2img.vercel.app';
const FILE_EXTENSION = "png";
const FILENAME_PREFIX = "Themeify";
const PARENT_ID = 'themeify-parent';
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

/**
 * @type {UserPreferences}
 * Default user preferences.
 * These can be changed by user from the extension options page (preferences.html)
 */
const defaultPreferences = {
    backgroundColor: 'radial-gradient(circle, rgba(63,94,251,1) 0%, rgba(252,70,107,1) 100%)',
    showBackground: 'true',
    backgroundImage: '',
    showLineNumbers: 'false',
    backgroundPadding: 5,
};

// Initialize default settings if running for the first time
chrome.storage.sync.get((prefs) => {
    if (Object.keys(prefs).length == 0) {
        chrome.storage.sync.set(defaultPreferences);
        chrome.storage.sync.set({defaults: JSON.stringify(defaultPreferences)});
    }
});

/**
 * Get timestamp in the format MMM_DD_YYYY_hhmmss
 * 
 * @returns {string}
 */
function getTimestamp() {
    const now = new Date();
    return [...now.toDateString().split(" ").splice(1), now.toTimeString().substring(0, 8).split(':').join('')].join('_');
}

/**
 * Update overlay text created from create-overlay.js
 * 
 * @param {string} newText 
 */
function updateOverlayText(newText) {
    chrome.tabs.executeScript({
        code: `(() => {
            let overlayText = document.getElementById('Themeify-Loading-Overlay-Text');
            if (overlayText) { 
                overlayText.textContent = "${newText}"; 
            }
        })();`,
    });
}

/**
 * Removes overlay
 */
function clearOverlay() {
    chrome.tabs.executeScript({
        code: `(() => {
            let overlayView = document.getElementById('Themeify-Loading-Overlay');
            if (overlayView) { 
                document.body.removeChild(overlayView);
            }
        })();`,
    });
}

// create context menus for languages and themes
chrome.contextMenus.create({
    title: 'Themeify',
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

        chrome.storage.sync.get(( /** @type {UserPreferences} */ preferences) => {
            let queryParams = new URLSearchParams();
            queryParams.set('language', selectedLanguage);
            queryParams.set('theme', selectedTheme);
            queryParams.set('background-color', preferences.backgroundColor);
            queryParams.set('show-background', preferences.showBackground);
            queryParams.set('line-numbers', preferences.showLineNumbers);
            queryParams.set('background-image', preferences.backgroundImage);
            queryParams.set('padding', preferences.backgroundPadding)

            // create overlay
            chrome.tabs.executeScript({
                file: 'js/create-overlay.js',
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
                    if (this.responseType === 'blob') {
                        const imageBlobUrl = window.URL.createObjectURL(this.response);

                        let downloadFileName = `${FILENAME_PREFIX}_${getTimestamp()}.${FILE_EXTENSION}`;

                        chrome.downloads.download({
                            url: imageBlobUrl,
                            saveAs: true,
                            filename: downloadFileName,
                        });
                    } else {
                        console.error('[Themeify Extension]: ', 'Unknown response, ignored');
                    }
                    durationMs = 0;
                } else {
                    updateOverlayText("Sorry, something went wrong 🤷‍♂️");
                }
                setTimeout(() => {
                    clearOverlay();
                }, durationMs);
            });
            request.open("POST", requestUrl);
            request.send(selectedText);
        });
    })
}