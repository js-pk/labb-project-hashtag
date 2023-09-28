import { setup } from './gameLogic.js';
import { loader } from './init.js';

export function loadResources() {
 // loader.onProgress.add(loadProgressHandler);
  loader.add('/images/sprites/soils.json')
    .add('/images/sprites/tools.json')
    .add('/images/sprites/rock-soils.json')
    .add('/images/tutorial/player.png')
    .add('/images/tutorial/star.png')
    .add('/images/tutorial/farm-plain-min.png')
    .load(setup);
}


if (document.getElementById('game1')) {
  loadResources();
}
