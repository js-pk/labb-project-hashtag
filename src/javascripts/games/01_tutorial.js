import * as PIXI from 'pixi.js';
import { app, loader } from './01_init.js';

let tutorialScene; let tutorialContainer; let tutorialText; let tutorialSprite; let
  tutorialStepIndex;
let endCallback;

const BASE_WIDTH = 750;
const BASE_FONT_SIZE = 24;

const tutorialOneSteps = [
  { text: '어서오세요.\n 당신이 000 씨로군요? \n저는 농부 랩삐입니다. \n▶', image: '/images/tutorial/farm-plain-min.png' },
  { text: '이번에 미술관에서 \n옥수수 농사를\n 지으려는데 일손이\n 부족합니다. ▶', image: '/images/tutorial/farm-plain-min.png' },
];

const tutorialTwoSteps = [
  // ... same content
];

const combinedTutorialSteps = [...tutorialOneSteps, ...tutorialTwoSteps];

function getResponsiveFontSize() {
  return BASE_FONT_SIZE * (app.screen.width / BASE_WIDTH);
}

function handleResize() {
  tutorialText.style.fontSize = getResponsiveFontSize();
  // Adjust wordWrapWidth if you want it responsive as well.
  tutorialText.style.wordWrapWidth = app.screen.width * 0.7; // Example
  updateTutorialStep();
}

export function createTutorial(appStage) {
  tutorialScene = new PIXI.Container();
  tutorialContainer = new PIXI.Container();
  tutorialText = new PIXI.Text('', {
    fontFamily: 'Arial',
    fontSize: getResponsiveFontSize(),
    fill: 'black',
    align: 'center',
    wordWrap: true,
    wordWrapWidth: app.screen.width * 0.7, // Example, adjust if needed
  });

  tutorialSprite = new PIXI.Sprite(PIXI.Texture.from('/images/tutorial/star.png'));

  tutorialContainer.addChild(tutorialSprite);
  tutorialContainer.addChild(tutorialText);

  tutorialScene.addChild(tutorialContainer);
  appStage.addChild(tutorialScene);

  window.addEventListener('resize', handleResize);
}

function resizeSpriteToAppSize(sprite) {
  let targetWidth = app.screen.width;
  let targetHeight = app.screen.height;

  // Compute sprite's aspect ratio
  const spriteRatio = sprite.width / sprite.height;

  // Adjust width & height based on aspect ratio
  if (targetWidth / targetHeight > spriteRatio) {
    targetHeight = targetWidth / spriteRatio;
  } else {
    targetWidth = targetHeight * spriteRatio;
  }

  sprite.width = targetWidth;
  sprite.height = targetHeight;

  // Center the sprite in the app (optional)
  sprite.x = (app.screen.width - sprite.width) / 2;
  sprite.y = (app.screen.height - sprite.height) / 2;
}

export function startTutorial(callback) {
  endCallback = callback;
  tutorialStepIndex = 0;
  updateTutorialStep();
  tutorialContainer.visible = true;
  tutorialScene.interactive = true;
  tutorialScene.on('pointerdown', advanceTutorial);
}

function updateTutorialStep() {
  if (tutorialStepIndex < combinedTutorialSteps.length) {
    const step = combinedTutorialSteps[tutorialStepIndex];
    tutorialText.text = step.text;

    if (step.image) {
      tutorialSprite.texture = PIXI.Texture.from(step.image);
    }
    resizeSpriteToAppSize(tutorialSprite);

    tutorialText.x = (tutorialScene.width - tutorialText.width) / 2;
    tutorialText.y = (tutorialScene.height - tutorialText.height) / 2;
    tutorialSprite.x = (tutorialScene.width - tutorialSprite.width) / 2;
    tutorialSprite.y = (tutorialScene.height - tutorialSprite.height) / 2;
  } else {
    endTutorial();
  }
}

function advanceTutorial() {
  tutorialStepIndex++;
  updateTutorialStep();
}

function endTutorial() {
  tutorialScene.off('pointerdown', advanceTutorial);
  window.removeEventListener('resize', handleResize); // Clean up
  tutorialContainer.visible = false;
  tutorialScene.parent.removeChild(tutorialScene);

  if (endCallback) endCallback();
}
