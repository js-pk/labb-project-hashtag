import * as PIXI from 'pixi.js';
import './02_init.js';

import { loadResources } from './02_resourceLoader.js';

if (document.getElementById('game2')) {
  loadResources();
}
