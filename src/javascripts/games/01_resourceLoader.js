import { setup } from './01_gameLogic.js';
import { loader } from './01_init.js';

export function loadResources() {
  loader.onProgress.add(loadProgressHandler);
  loader.add('/images/sprites/soils.json')
    .add('/images/sprites/tools.json')
    .add('/images/sprites/rock-soils.json')
    .add('/images/tutorial/player.png')
    .add('/images/tutorial/star.png')

    .add('/images/tutorial/farm-plain-min.png')
    .load(setup);
}

export function loadProgressHandler(loader, resource) {
  console.log(`loading:${resource.url}`);
  console.log(`progress: ${loader.progress}%`);
}
