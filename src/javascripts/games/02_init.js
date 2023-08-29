import * as PIXI from 'pixi.js';

export const Application = PIXI.Application;
export const Container = PIXI.Container;
export const loader = PIXI.Loader.shared;
export const resources = PIXI.Loader.shared.resources;
export const TextureCache = PIXI.utils.TextureCache;
export const Sprite = PIXI.Sprite;
export const Rectangle = PIXI.Rectangle;
export const Graphics=PIXI.Graphics;

export const width = window.innerWidth;
export const height = width * 16/10;

export const app = new PIXI.Application({
    width: width,
    height: height,
    antialias: true,
    transparent: true,
    resolution: window.innerWidth.devicePixelRatio || 1
});

//app.renderer.backgroundColor= 0xAAAAAA;
app.renderer.autoDensity = true;
app.renderer.view.style.position = "absolute";
app.renderer.view.style.display = "block";
app.renderer.view.style.border="2px solid #333";
app.renderer.resizeTo = window;


document.body.appendChild(app.view);

let background = new PIXI.Sprite();
app.stage.addChild(background);

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}


export function resize() {
    let w, h;

    // Determine window's aspect ratio
    const windowRatio = window.innerWidth / window.innerHeight;
    
   // Game's target aspect ratio for landscape
    const landscapeGameRatio = 16 / 10;

    // Game's target aspect ratio for portrait
    const portraitGameRatio = 10 / 16;

    if (window.innerWidth > window.innerHeight) { // Landscape mode
        w = window.innerWidth;
        h = w / landscapeGameRatio;
    } else { // Portrait mode
        h = window.innerHeight;
        w = h * portraitGameRatio;
    }

    // Resize the renderer
    app.renderer.resize(w, h);

    // Adjust the position to center the game on the screen
    app.renderer.view.style.left = `${(window.innerWidth - w) / 2}px`;
    app.renderer.view.style.top =0;
    
}
// Debounced version of the resize function
const debouncedResize = debounce(resize, 100);

// Handle the resize event
window.addEventListener("resize", debouncedResize);

// Initial resize
resize();