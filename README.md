# Code2Image [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)]() [![GitHub license](https://img.shields.io/github/license/cyberpirate92/code2img-chrome.svg?style=for-the-badge)](https://github.com/cyberpirate92/code2img-chrome/blob/master/LICENSE) [![Chrome Web Store](https://img.shields.io/chrome-web-store/v/abloihkaeipjifnhehnicpjfjoaclngo?style=for-the-badge)](https://chrome.google.com/webstore/detail/code2image/abloihkaeipjifnhehnicpjfjoaclngo)

A Google Chrome browser extension to create pretty images of code snippets powered by the [code2img](https://github.com/cyberpirate92/code2img) REST API.

[![](https://developer.chrome.com/webstore/images/ChromeWebStore_Badge_v2_496x150.png)](https://chrome.google.com/webstore/detail/code2image/abloihkaeipjifnhehnicpjfjoaclngo)

![](./images/demo.gif)

## Installing locally for Development

1. Clone this repository `git clone https://github.com/cyberpirate92/code2img-chrome`.
2. Open Google Chrome and open Extension Management page by navigating to `chrome://extensions`.
3. Turn on **Developer Mode**.
4. Click on the **LOAD UNPACKED** button and select the `src` directory from the project folder.

![](./images/load_extension.png)

5. The extension is now installed locally.

## Usage 

1. Select the text (code snippet) on the page that you want to include in the image.
2. Right click and select Code2Image and in the submenu, select the language.
3. In the language submenu, select a color theme.

![](./images/context-menu2-screenshot.png)

4. A file save dialog will appear where you can rename the file 
if required and save the image.

![](./images/download-dialog-screenshot.png)

## Sample Image generated using Code2Image extension

![](./images/sample-image.png)
