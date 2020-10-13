/**
* @typedef {Object} UserPreferences
* @property {string} backgroundColor
* @property {string} showBackground
* @property {string} backgroundImage
* @property {string} showLineNumbers
* @property {number} backgroundPadding
*/

/**
 * @typedef {Object} Themes
 * @property {string[]} themes
 */

/**
* Fetch theme list from backend

* @retuns {Themes} Theme list
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
 * Get boolean value from their string representation
 * @param {string} str The string representation
 * 
 * @returns {boolean} The equivalent boolean value for the given string representation
 */
function fromBooleanString(str) {
    return str === 'true';
}

/**
 * Generate preview and set it as the source to the provided image element 
 * 
 * @param {HTMLImageElement} imageElement 
 * @param {HTMLDivElement} spinnerElement
 * @param {HTMLDivElement} errorAlert
 * @param {UserPreferences} preferences 
 */
function generatePreview(imageElement, spinnerElement, errorAlert, preferences) {
    try {
        errorAlert && errorAlert.classList.add('d-none');
        spinnerElement && spinnerElement.classList.remove('d-none');
        imageElement && imageElement.classList.add('d-none');

        let queryParams = new URLSearchParams();
        queryParams.set('language', 'java');
        queryParams.set('theme', 'xonokai');
        queryParams.set('background-color', preferences.backgroundColor);
        queryParams.set('show-background', preferences.showBackground);
        queryParams.set('line-numbers', preferences.showLineNumbers);
        queryParams.set('background-image', preferences.backgroundImage);
        queryParams.set('padding', preferences.backgroundPadding);
        queryParams.set('scale', 1); // since this is just a preview, no need for high res images here

        let requestUrl = `https://code2img.vercel.app/api/to-image?${queryParams.toString()}`;
        let request = new XMLHttpRequest();
        request.responseType = 'blob';
        request.addEventListener("load", function () {
            spinnerElement && spinnerElement.classList.add('d-none');
            imageElement && imageElement.classList.remove('d-none');
            if (this.readyState === 4) {
                if (this.status === 200) {
                    if (this.responseType === 'blob') {
                        const imageBlobUrl = window.URL.createObjectURL(this.response);
                        imageElement.src = imageBlobUrl;
                    } else {
                        console.error('[Themeify Extension]: ', 'Unknown response, ignored');
                    }
                } else {
                    spinnerElement && spinnerElement.classList.add('d-none');
                    imageElement && imageElement.classList.add('d-none');
                    errorAlert && errorAlert.classList.remove('d-none');
                    console.error('Generating preview failed');
                }
            }
        });
        request.open("POST", requestUrl);
        request.send(previewCode);
    } catch (error) {
        spinnerElement && spinnerElement.classList.add('d-none');
        imageElement && imageElement.classList.add('d-none');
        errorAlert && errorAlert.classList.remove('d-none');
        console.error(error);
    }
}

/**
* Make sure `value` is between the inclusive range (`minValue`, `maxValue`)
* @param {number} value The value to be normalized 
* @param {number} minValue Inclusive Upper bound
* @param {number} maxValue Inclusive Lower bound
* 
* @returns {number} Number guarenteed to be in the inclusive range (`minValue`, `maxValue`)
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
    
    /** @type {HTMLInputElement} */
    let showBackgroundCheckbox = document.querySelector('#showBackground');
    
    /** @type {HTMLInputElement} */
    let backgroundPaddingInput = document.querySelector('#backgroundPadding');
    
    /** @type {HTMLInputElement} */
    let backgroundImageInput = document.querySelector('#backgroundImage');

    /** @type {HTMLImageElement} */
    let backgroundImagePreview = document.querySelector('#backgroundImagePreview');
    
    /** @type {HTMLDivElement} */
    let backgroundPrefsSection = document.querySelector('#backgroundPrefsSection');

    /** @type {HTMLDivElement} */
    let saveSuccessfulAlert = document.querySelector('#saveSuccessfulAlert');

    /** @type {HTMLButtonElement} */
    let setDefaultsButton = document.querySelector('#setDefaultsButton');

    /** @type {HTMLButtonElement} */
    let previewButton = document.querySelector('#previewButton');

    /** @type {HTMLImageElement} */
    let settingsPreviewImage = document.querySelector('#settingsPreviewImage');

    /** @type {HTMLDivElement} */
    let settingsPreviewSection = document.querySelector('#settingsPreviewSection');

    /** @type {HTMLDivElement} */
    let previewLoadingSpinner = document.querySelector('#previewLoadingSpinner');

    /**
     * Get settings configured on page (Not saved settings)
     * 
     * @returns {UserPreferences}
     */
    function getSettings() {
        return {
            showLineNumbers: lineNumbersCheckbox.checked.toString(),
            backgroundColor: backgroundColorTextbox.value,
            showBackground: showBackgroundCheckbox.checked.toString(),
            backgroundPadding: normalize(backgroundPaddingInput.value, 1, 15),
            backgroundImage: backgroundImageInput.value || '',
        };
    }
    
    /**
    * Populate form values from storage
    */
    function populateValues() {
        chrome.storage.sync.get((/** @type {UserPreferences} */ savedPrefs) => {
            lineNumbersCheckbox.checked = fromBooleanString(savedPrefs.showLineNumbers);
            backgroundColorTextbox.value = savedPrefs.backgroundColor;
            showBackgroundCheckbox.checked = fromBooleanString(savedPrefs.showBackground);
            backgroundPaddingInput.value = savedPrefs.backgroundPadding;
            backgroundImageInput.value = savedPrefs.backgroundImage || '';

            if (showBackgroundCheckbox.checked) {
                backgroundPrefsSection.classList.remove('d-none');
            } else {
                backgroundPrefsSection.classList.add('d-none');
            }

            if (backgroundImagePreview) {
                backgroundImagePreview.src = backgroundImageInput.value;
                
                if (!backgroundImageInput.value) {
                    backgroundImagePreview.parentElement.classList.add('d-none');   
                } else {
                    backgroundImagePreview.parentElement.classList.remove('d-none');
                }
            }
        });
    }
    
    saveButton.addEventListener('click', () => {
        const prefs = getSettings();
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
    
    showBackgroundCheckbox.addEventListener('change', () => {
        if (showBackgroundCheckbox.checked) {
            backgroundPrefsSection.classList.remove('d-none');
        } else {
            backgroundPrefsSection.classList.add('d-none');
        }
    });

    backgroundImageInput.addEventListener('change', () => {
        if (backgroundImageInput.value) {
            backgroundImagePreview.src = backgroundImageInput.value;
            backgroundImagePreview.parentElement.classList.remove('d-none');
        } else {
            backgroundImagePreview.parentElement.classList.add('d-none')
        }
    });

    previewButton.addEventListener('click', () => {
        settingsPreviewSection.classList.remove('d-none');
        generatePreview(settingsPreviewImage, previewLoadingSpinner, document.querySelector('#previewErrorAlert'), getSettings());
    });
    
    window.addEventListener('load', () => {
        populateValues();
    });
})();

/**
 * The source code snippet that will be 
 * used for generating the preview
 */
const previewCode = `/*
 * 🔥🔥 Generated with Themeify 🔥🔥
 */
import java.util.*; 
class FizzBuzz
{
    public static void main(String args[])
    {
        int n = 100;

        // loop for 100 times                                                                    
        for (int i=1; i<=n; i++)
        {
            if (i%15==0)
                System.out.print("FizzBuzz"+" ");
            // number divisible by 5, print 'Buzz'
            // in place of the number                                                                    
            else if (i%5==0)
                System.out.print("Buzz"+" ");
  
            // number divisible by 3, print 'Fizz'
            // in place of the number                                                                    
            else if (i%3==0)
                System.out.print("Fizz"+" ");
  
            // number divisible by 15(divisible by
            // both 3 & 5), print 'FizzBuzz' in
            // place of the number                                                                    
                  
            else // print the numbers
                System.out.print(i+" ");
        }
    }
}`;