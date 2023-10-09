import { setup } from './gameLogic.js';
import { loader } from './init.js';

export function loadResources() {
 // loader.onProgress.add(loadProgressHandler);
  loader.add('/images/sprites/soils.json')
    .add('/images/sprites/items.json')
    .add('/images/sprites/rock-soils.json')
    .add('/images/sprites/faces.json')
    .add('/images/sprites/earthworm.json')
    .load(setup);
}


if (document.getElementById('game1')) {
  loadResources();
}
