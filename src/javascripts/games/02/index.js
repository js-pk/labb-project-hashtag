// import { loadResources } from './resourceLoader.js';

import { setup } from './gameLogic.js';
import { loader } from './init.js';

export function loadResources() {
  loader.onProgress.add(loadProgressHandler);
  loader.add('/images/sprites/2/bg-soil-glitch.json')
    .add('/images/sprites/2/corn01.png')
    .add('/images/sprites/2/corn02.png')
    .add('/images/sprites/2/corn03.png')
    .add('/images/sprites/2/corn04.png')
    .add('/images/sprites/2/corn05.png')
    .add('/images/sprites/soils.json')
    .add('/images/sprites/2/bees-spritesheet.json')
    .add('/images/sprites/2/moth-spritesheet.json')
    .add('/images/sprites/2/crow_from_left.json')
    .add('/images/sprites/2/crow_from_right.json')
    .add('/images/sprites/2/waterDeer_from_left.json')
    .add('/images/sprites/2/waterDeer_from_Right.json')
    .add('/images/sprites/2/boar_fromLeft.json')
    .add('/images/sprites/2/boar_fromRight.json')
    .add('/images/sprites/2/weeds.json')
    .add('/images/sprites/2/corn-fail.json')
    .load(setup);
}

export function loadProgressHandler(loader, resource) {
  console.log(`loading:${resource.url}`);
  console.log(`progress: ${loader.progress}%`);
}


if (document.getElementById('game2')) {
  loadResources();
}
