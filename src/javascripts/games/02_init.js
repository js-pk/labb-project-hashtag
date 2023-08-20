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
    transparent: false,
    resolution: window.innerWidth.devicePixelRatio || 1
});

app.renderer.backgroundColor= 0xAAAAAA;
app.renderer.autoDensity = true;
app.renderer.view.style.position = "absolute";
app.renderer.view.style.display = "block";
app.renderer.resizeTo = window;


document.getElementById("game2").appendChild(app.view);

 // Handle the resize event
window.addEventListener("resize", () => {
    // Adjust width and height according to the new window width
    const newWidth = window.innerWidth;
    const newHeight = newWidth * 16/10;

    app.renderer.resize(newWidth, newHeight);
});