import * as PIXI from 'pixi.js';
import './init.js';

import { loadResources } from './01_resourceLoader.js';

if (document.getElementById('game1')) {
  loadResources();
}
