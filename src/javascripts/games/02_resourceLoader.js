import {setup } from './02_gameLogic.js';
import {loader} from './02_init.js';

export function loadResources() {
    loader.onProgress.add(loadProgressHandler);
    loader.add("/images/sprites/bg-soil-glitch.json")
    .add("/images/sprites/corn01.png")
    .add("/images/sprites/corn02.png")
    .add("/images/sprites/corn03.png")
    .add("/images/sprites/corn04.png")
    .add("/images/sprites/corn05.png")
    .add("/images/sprites/soils.json")
    .add("/images/sprites/bees-spritesheet.json")
    .add("/images/sprites/moth-spritesheet.json")
    .add("/images/sprites/crow_from_left.json")
    .add("/images/sprites/crow_from_right.json")
    .add("/images/sprites/waterDeer_from_left.json")
    .add("/images/sprites/waterDeer_from_Right.json")
    .add("/images/sprites/boar_fromLeft.json")
    .add("/images/sprites/boar_fromRight.json")
    .load(setup);
}

export function loadProgressHandler(loader, resource) {
    console.log("loading:" + resource.url);
    console.log("progress: " + loader.progress + "%");
}