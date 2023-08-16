import * as PIXI from 'pixi.js';

export const Application = PIXI.Application;
export const Container = PIXI.Container;
export const loader = PIXI.Loader.shared;
export const resources = PIXI.Loader.shared.resources;
export const TextureCache = PIXI.utils.TextureCache;
export const Sprite = PIXI.Sprite;
export const Rectangle = PIXI.Rectangle;
export const Graphics=PIXI.Graphics;

export const height = window.innerHeight;
export const width = height * 10/16;

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
app.renderer.autoDensity = true;

document.getElementById("game1").appendChild(app.view);

 