import * as PIXI from 'pixi.js';

// Constants and PIXI setups
export const Application = PIXI.Application;
export const Container = PIXI.Container;
export const loader = PIXI.Loader.shared;
export const resources = PIXI.Loader.shared.resources;
export const TextureCache = PIXI.utils.TextureCache;
export const Sprite = PIXI.Sprite;
export const Rectangle = PIXI.Rectangle;
export const Graphics = PIXI.Graphics;

const maxPixelRatio = 2; // Adjust to preference
export const resolution = Math.min(window.devicePixelRatio, maxPixelRatio);
//const resolution=1;
export const width = window.innerWidth;
export const height = window.innerHeight;

// Set the scale mode
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.LINEAR; // or PIXI.SCALE_MODES.NEAREST if you prefer

export const app = new PIXI.Application({
    width: width,
    height: height,
    antialias: true,
    transparent: true,
    resolution: resolution
});

//app.renderer.autoDensity = true;
app.renderer.view.style.position = "absolute";
app.renderer.view.style.display = "block";
app.renderer.view.style.border = "2px solid #333";
//app.renderer.resizeTo = window;

document.getElementById('game1').appendChild(app.view);

// Utility functions
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

    const landscapeGameRatio = 16 / 10;
    const portraitGameRatio = 10 / 16;

    if (window.innerWidth > window.innerHeight) {
        // Landscape Mode
        w = window.innerWidth;
        h = w / landscapeGameRatio;

        if (h > window.innerHeight) {
            h = window.innerHeight;
            w = h * landscapeGameRatio;
        }
    } else {
        // Portrait Mode
        h = window.innerHeight;
        w = h * portraitGameRatio;

        if (w > window.innerWidth) {
            w = window.innerWidth;
            h = w / portraitGameRatio;
        }
    }

    app.renderer.resize(w*resolution, h*resolution); 
    console.log('w:',w);
    console.log('resolution',resolution);
    app.renderer.view.style.width = `${w}px`;
    app.renderer.view.style.height = `${h}px`;
    console.log('appStyleWidth', app.renderer.view.style.width);
    console.log('appViewWidth',app.view.width);
    //adjust the css display size
   // app.renderer.view.style.left = `${(window.innerWidth - w) / 2}px`;
   app.renderer.view.style.left=0;
   // app.renderer.view.style.top = `${(window.innerHeight - h) / 2}px`;
   app.renderer.view.style.top=0;
}

const debouncedResize = debounce(resize, 100);
window.addEventListener("resize", debouncedResize);
resize();

