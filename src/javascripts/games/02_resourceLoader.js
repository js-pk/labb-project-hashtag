import {setup } from './02_gameLogic.js';
import {loader} from './02_init.js';

export function loadResources() {
    loader.onProgress.add(loadProgressHandler);
    loader.add("/images/sprites/bg-soil-glitch.json")
    .add("/images/sprites/myJason.json")
    .add("/images/sprites/corn01.png")
    .load(setup);
    
}

export function loadProgressHandler(loader, resource) {
    console.log("loading:" + resource.url);
    console.log("progress: " + loader.progress + "%");
}