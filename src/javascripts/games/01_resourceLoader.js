import {setup } from './01_gameLogic.js';
import {loader} from './01_init.js';

export function loadResources() {
    loader.onProgress.add(loadProgressHandler);
    loader.add("/images/sprites/game01.json")
    .add("/images/sprites/tools.json")
    .load(setup);
}

export function loadProgressHandler(loader, resource) {
    console.log("loading:" + resource.url);
    console.log("progress: " + loader.progress + "%");
}