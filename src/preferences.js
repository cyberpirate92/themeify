/**
* @typedef {Object} UserPreferences
* @property {string} backgroundColor
* @property {string} showBackground
* @property {string} backgroundImage
* @property {string} showLineNumbers
* @property {number} backgroundPadding
*/


/**
* Fetch theme list from backend
*/
async function getThemeList() {
    const response = await fetch('https://code2img.vercel.app/api/themes');
    if (!response.ok) {
        throw Error(`Failed to load theme list: ${response.status} ${response.statusText || ''}`);
    }
    const responseObj = await response.json();
    return responseObj;
}

/**
* Make sure `value` is between `minValue` and `maxValue`
* @param {number} value The value to be normalized 
* @param {number} minValue The upper bound possible for the given value
* @param {number} maxValue The lower bound possible for the given value
* 
* @returns {number} Number guarenteed to be in the inclusive range {minValue, maxValue}
*/
function normalize(value, minValue, maxValue) {
    return Math.max(Math.min(value, maxValue), minValue);
}

(() => {
    /** @type {HTMLButtonElement} */
    let saveButton = document.querySelector('#saveButton');
    
    /** @type {HTMLButtonElement} */
    let resetButton = document.querySelector('#resetButton');
    
    /** @type {HTMLInputElement} */
    let lineNumbersCheckbox = document.querySelector('#showLineNumbers');
    
    /** @type {HTMLInputElement} */
    let backgroundColorTextbox = document.querySelector('#backgroundColor');
    
    /** @type {HTMLDivElement} */
    let backgroundColorPreview = document.querySelector('#backgroundColorPreview');
    
    /** @type {HTMLInputElement} */
    let showBackgroundCheckbox = document.querySelector('#showBackground');
    
    /** @type {HTMLInputElement} */
    let backgroundPaddingInput = document.querySelector('#backgroundPadding');
    
    /** @type {HTMLInputElement} */
    let backgroundImageInput = document.querySelector('#backgroundImage');
    
    /** @type {HTMLDivElement} */
    let backgroundPrefsSection = document.querySelector('#backgroundPrefsSection');

    /** @type {HTMLDivElement} */
    let saveSuccessfulAlert = document.querySelector('#saveSuccessfulAlert');

    /** @type {HTMLButtonElement} */
    let setDefaultsButton = document.querySelector('#setDefaultsButton');
    
    /**
    * Populate form values from storage
    */
    function populateValues() {
        chrome.storage.sync.get((/** @type {UserPreferences} */ savedPrefs) => {
            lineNumbersCheckbox.checked = savedPrefs.showLineNumbers === 'true';
            backgroundColorTextbox.value = savedPrefs.backgroundColor;
            showBackgroundCheckbox.checked = savedPrefs.showBackground === 'true';
            backgroundPaddingInput.value = savedPrefs.backgroundPadding;
            backgroundImageInput.value = savedPrefs.backgroundImage || '';
            
            if (backgroundColorPreview) {
                backgroundColorPreview.style.background = backgroundColorTextbox.value;
            }

            if (!showBackgroundCheckbox.checked) {
                backgroundPrefsSection.classList.add('d-none');
            }
        });
    }
    
    saveButton.addEventListener('click', () => {
        /** @type {UserPreferences} */
        const prefs = {
            showLineNumbers: lineNumbersCheckbox.checked ? 'true' : 'false',
            backgroundColor: backgroundColorTextbox.value,
            showBackground: showBackgroundCheckbox.checked ? 'true' : 'false',
            backgroundPadding: Math.max(Math.min(backgroundPaddingInput.value, 15), 1),
            backgroundImage: backgroundImageInput.value || '',
        };
        chrome.storage.sync.set(prefs, () => {
            saveSuccessfulAlert.classList.remove('d-none');
            window.setTimeout(() => {
                saveSuccessfulAlert.classList.add('d-none');
            }, 5000)
        });
    });

    setDefaultsButton.addEventListener('click', () => {
        chrome.storage.sync.get((prefs) => {
            if (prefs.defaults) {
                let defaultPrefs = JSON.parse(prefs.defaults);
                chrome.storage.sync.set(defaultPrefs);
                populateValues();
            }
        });
    });
    
    resetButton.addEventListener('click', () => {
        populateValues();
    });
    
    backgroundColorTextbox.addEventListener('input', () => {
        backgroundColorPreview.style.background = backgroundColorTextbox.value;
    });
    
    showBackgroundCheckbox.addEventListener('change', () => {
        if (showBackgroundCheckbox.checked) {
            backgroundPrefsSection.classList.remove('d-none');
        } else {
            backgroundPrefsSection.classList.add('d-none');
        }
    });
    
    window.addEventListener('load', () => {
        populateValues();
    });
})();