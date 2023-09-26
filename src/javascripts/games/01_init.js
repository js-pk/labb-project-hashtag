import * as PIXI from 'pixi.js';

// Constants and PIXI setups
export const { Application } = PIXI;
export const loader = PIXI.Loader.shared;
export const { resources } = PIXI.Loader.shared;
export const { TextureCache } = PIXI.utils;
export const { Sprite } = PIXI;
export const { Rectangle } = PIXI;
export const { Graphics } = PIXI;

export const resolution = 1; // Hardcoded resolution to 1
export const width = window.innerWidth;
export const height = window.innerHeight;

// Set the scale mode
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.LINEAR;

export const app = new PIXI.Application({
  width,
  height,
  antialias: true,
  transparent: true,
  resolution,
});

// will-read-frequently 속성 추가
app.renderer.view.setAttribute('will-read-frequently', 'true');

app.renderer.view.style.position = 'absolute';
app.renderer.view.style.display = 'block';
app.renderer.view.style.border = '2px solid #333';
app.renderer.view.style.width = '100%';

if (document.getElementById('game1')) {
  document.getElementById('game1').appendChild(app.view);
}

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
  console.log('Resize function called!');

  let w; let
    h;

  const portraitGameRatio = 10 / 16;
  const isLandscape = window.matchMedia('(orientation: landscape)').matches;

  const actualWidth = isLandscape ? window.innerHeight : window.innerWidth;
  const actualHeight = isLandscape ? window.innerWidth : window.innerHeight;

  h = actualHeight;
  w = h * portraitGameRatio;

  if (w > actualWidth) {
    w = actualWidth;
    h = w / portraitGameRatio;
  }

  app.renderer.resize(w, h); // Removed the multiplication by resolution
  app.renderer.view.style.width = `${w}px`;
  app.renderer.view.style.height = `${h}px`;

  app.renderer.view.style.left = `${(actualWidth - w) / 2}px`;
  app.renderer.view.style.top = 0;
}

const debouncedResize = debounce(resize, 100);
window.addEventListener('resize', debouncedResize);
resize();
