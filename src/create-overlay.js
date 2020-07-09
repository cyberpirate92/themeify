(() => {
    /*
    position: fixed;
    left: 0px;
    right: 0px;
    top: 0px;
    bottom: 0px;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 999999;
    */
    
    let overlayView = document.createElement('div');
    overlayView.style.position = 'fixed';
    overlayView.style.left = '0px';
    overlayView.style.right = '0px';
    overlayView.style.top = '0px';
    overlayView.style.bottom = '0px';
    overlayView.style.backgroundColor = 'rgba(0, 0, 0 ,0.5)';
    overlayView.style.zIndex = 2147483647;
    overlayView.setAttribute('id', 'Code2Image-Loading-Overlay');
    
    /*
    font-size: 5rem;
    color: rgb(255, 255, 255);
    z-index: 9999999;
    position: fixed;
    width: 100%;
    margin-top: 50%;
    height: 100vh;
    text-align: center;
    */
    let overlayText = document.createElement('div');
    overlayText.style.fontSize = '4rem';
    overlayText.style.color = '#fff';
    overlayText.style.zIndex = 2147483647;
    overlayText.style.width = '100%';
    overlayText.style.marginTop = '30%';
    overlayText.style.textAlign = 'center';
    overlayText.textContent = "Generating Image (0%), please wait...";
    overlayText.setAttribute('id', 'Code2Image-Loading-Overlay-Text');
    
    overlayView.appendChild(overlayText);
    document.body.appendChild(overlayView);
})();