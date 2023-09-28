import * as PIXI from 'pixi.js';
import './init.js';

import { loadResources } from './resourceLoader.js';

if (document.getElementById('game2')) {
  loadResources();
}
