import * as PIXI from 'pixi.js';

export const { Application } = PIXI;
export const { Container } = PIXI;
export const loader = PIXI.Loader.shared;
export const { resources } = PIXI.Loader.shared;
export const { TextureCache } = PIXI.utils;
export const { Sprite } = PIXI;
export const { Rectangle } = PIXI;
export const { Graphics } = PIXI;

export const resolution = 2;
export const width = window.innerWidth;
export const height = window.innerHeight;

// Set the scale mode
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.LINEAR; // or PIXI.SCALE_MODES.NEAREST if you prefer

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
//app.renderer.view.style.border = '2px solid #333';
app.renderer.view.style.width = '100%';

if (document.getElementById('game2')) {
  document.getElementById('game2').appendChild(app.view);
}

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
  let w; let h;

  const portraitGameRatio = 10 / 16;

  // Detect landscape orientation
  const isLandscape = window.matchMedia('(orientation: landscape)').matches;

  // Swap values for width and height if in landscape
  const actualWidth = isLandscape ? height : width;
  const actualHeight = isLandscape ? width : height;

  h = actualHeight;
  w = h * portraitGameRatio;

  if (w > actualWidth) {
    w = actualWidth;
    h = w / portraitGameRatio;
  }

  // app.renderer.resize(w * resolution, h * resolution);
  app.renderer.resize(w, h);
  app.renderer.view.style.width = `${w}px`;
  app.renderer.view.style.height = `${h}px`;
  // console.log(app.renderer.width, app.render.height)
 
  app.renderer.view.style.left = `${(actualWidth - w) / 2}px`;
  app.renderer.view.style.top = '0px';
}

const debouncedResize = debounce(resize, 100);
window.addEventListener('resize', debouncedResize);

// Initial resize
resize();
