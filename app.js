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

chrome.contextMenus.create({
    title: 'Code2Image',
    contexts: ['selection'],
    id: PARENT_ID
}, () => {
    languages.forEach(language => {
        chrome.contextMenus.create({
            title: language,
            parentId: PARENT_ID,
            id: `${PARENT_ID}_${language}`,
            contexts: ['selection'],
            onclick: (event, tab) => {
                handleClick(event, tab, language);
            },
        });
    });
});

/**
* 
* @param {chrome.contextMenus.OnClickData} event 
* @param {chrome.tabs.Tab} tab 
* @param {string} selectedLanguage 
*/
function handleClick(event, tab, selectedLanguage) {
    // event.selectionText does not preserve line breaks :(
    chrome.tabs.executeScript( {
        code: "window.getSelection().toString();"
    }, (selection) => {
        const selectedText = selection[0];
        console.info('🔥', event.selectionText);
        console.info('🔥', `Selected Language: ${selectedLanguage}`);
        
        let queryParams = new URLSearchParams();
        queryParams.set('language', selectedLanguage);
        queryParams.set('theme', 'atom-dark');
        queryParams.set('scale', '2');
        queryParams.set('line-numbers', 'false');
        queryParams.set('_now_no_cache', '1');
        
        let requestUrl = `${API_ENDPOINT}/api/to-image?${queryParams.toString()}`;
        let request = new XMLHttpRequest();
        request.responseType = 'blob';
        request.addEventListener("load", function () {
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
            } else {
                console.warn('❌', `code2img: Error in request ${requestUrl}`, this.responseText);
            }
        });
        request.open("POST", requestUrl);
        request.send(selectedText);
    }) 
}