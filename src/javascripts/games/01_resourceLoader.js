import {setup } from './01_gameLogic.js';
import {loader} from './01_init.js';

export function loadResources() {
    loader.onProgress.add(loadProgressHandler);
    loader.add("/images/sprites/soils.json")
    .add("/images/sprites/tools.json")
    .add("/images/sprites/BG_01_750x1200.png")
    .add("/images/sprites/BG_01_750x1200_LANDSCAPE.png")
    .add("/images/sprites/rock-soils.json")
    .load(setup);
}

export function loadProgressHandler(loader, resource) {
    console.log("loading:" + resource.url);
    console.log("progress: " + loader.progress + "%");
}