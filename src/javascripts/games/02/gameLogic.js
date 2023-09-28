import * as PIXI from 'pixi.js';

import {
  app, Container, Sprite, TextureCache, Graphics, resources, resolution,
} from './init.js';
import { common } from '../../common.js';

let countdownText; let id; let soils; let bgSprites; let batContainer; let gameScene; let gameOverScene; let GameoverText; let state; let bg; let cornfail;
let countdownTime = 100;
let lastTime = Date.now();
let cornSprite1; let cornSprite2; let cornSprite3; let cornSprite4; let cornSprite5; let cornAni1; let cornSpriteSheets; let beeFrames; let mothFrames; let walkingRightTextures1; let walkingRightTextures2; let walkingRightTextures3; let walkingLeftTextures1; let walkingLeftTextures2; let walkingLeftTextures3;
let scale; let batSize; let retryButton; let exitButton; let YesButton; let NoButton; let weeds; let
  weedKeys;
// 밭 한칸당 4점 x 24 = 96점
let score = 96;
let ecoPoint = 0;

// Assuming your 750px wide window fits 4 columns with 60 spacing in portrait
const baseWindowWidth = 750 / 2;

scale = app.view.width / baseWindowWidth;

const baseBatSize = 30; // Original rectangle size

batSize = baseBatSize * scale;

let currentSpriteSheetIndex = 0;
let accumulatedTime = 0;
let numberOfCol=4; let numberOfRows=6; let cornSprites=[];
export function setup() {
  bgSprites = resources['/images/sprites/2/bg-soil-glitch.json'].textures;
  cornSprite1 = resources['/images/sprites/2/corn01.png'].texture;
  cornSprite2 = resources['/images/sprites/2/corn02.png'].texture;
  cornSprite3 = resources['/images/sprites/2/corn03.png'].texture;
  cornSprite4 = resources['/images/sprites/2/corn04.png'].texture;
  cornSprite5 = resources['/images/sprites/2/corn05.png'].texture;
  cornSpriteSheets = [cornSprite1, cornSprite2, cornSprite3, cornSprite4, cornSprite5];

  beeFrames = resources['/images/sprites/2/bees-spritesheet.json'].textures;
  mothFrames = resources['/images/sprites/2/moth-spritesheet.json'].textures;

  walkingRightTextures1 = resources['/images/sprites/2/crow_from_left.json'].textures;
  walkingRightTextures2 = resources['/images/sprites/2/waterDeer_from_left.json'].textures;
  walkingRightTextures3 = resources['/images/sprites/2/boar_fromLeft.json'].textures;
  walkingLeftTextures1 = resources['/images/sprites/2/crow_from_right.json'].textures;
  walkingLeftTextures2 = resources['/images/sprites/2/waterDeer_from_Right.json'].textures;
  walkingLeftTextures3 = resources['/images/sprites/2/boar_fromRight.json'].textures;
  soils = resources['/images/sprites/soils.json'].textures;
  weeds = resources['/images/sprites/2/weeds.json'].textures;
  cornfail = resources['/images/sprites/2/corn-fail.json'].textures;
  weedKeys = Object.keys(weeds);

  gameScene = new Container();
  app.stage.addChild(gameScene);


  createBat();

  createGameOverScene();

  createRetryButtons();
  createYesorNoButtons();
  state = play;

  app.ticker.add(gameLoop);
}



function createBat() {
  const cornFrames = getCornFrames(cornSpriteSheets[currentSpriteSheetIndex]);
  batContainer = new Container();
    cornSprites = new Array(numberOfCol).fill(null).map(() => new Array(numberOfRows).fill(null));

  for (let i = 0; i < numberOfCol; i++) {
    for (let j = 0; j < numberOfRows; j++) {
      const batSpot = new Sprite(soils['soils03@3x.png']);
      batSpot.isFilled = false;
      batSpot.width = batSize;
      batSpot.height = batSize;
      const x = batSize * i;
      const y = batSize * j;
      batSpot.x = x;
      batSpot.y = y;
      batContainer.addChild(batSpot);

      cornAni1 = new PIXI.AnimatedSprite(cornFrames);
      
      cornAni1.isFilled = false;
      cornAni1.interactive = true;
      cornAni1.width = batSize;
      cornAni1.height = batSize;
      cornAni1.x = batSpot.x;
      cornAni1.y = batSpot.y;
      cornAni1.animationSpeed = 0.1;
      cornAni1.play();

      cornAni1.isLeftmost = (i === 0);

      cornAni1.isRightmost = (i === numberOfCol - 1);

      cornAni1.isUppermost = (j === 0);

      cornAni1.isBottommost = (j === numberOfRows - 1);
      batContainer.addChild(cornAni1);
      
      cornSprites[i][j] = cornAni1; // populate the array with the corn sprite references

    }
  }

  batContainer.x = ((app.view.width / resolution) - batContainer.width) / 2;
  batContainer.y = ((app.view.height / resolution) - batContainer.height) / 2;
  gameScene.addChild(batContainer);
    createCountdown();

}
function createCountdown() {
  if (countdownText) {
    gameScene.removeChild(countdownText);
    countdownText = null;
  }
  let labelText=new PIXI.Text('Time Left: ', {fontFamily:'Arial', fontSize:36, fill: 'black'});
  countdownText = new PIXI.Text('60', { fontFamily: 'Arial', fontSize: 36, fill: 'black' });
// Set the x coordinate to the middle of the view
  let x = (app.view.width / resolution) / 2;
  
  labelText.x = x - labelText.width / 2-100; // Center-align the label
  countdownText.x = x + countdownText.width / 2; // Center-align the countdown number
  
  // Position the texts above the batContainer
  labelText.y = batContainer.y - labelText.height - 30; // 30 is the margin between the label and the batContainer
  countdownText.y = batContainer.y - countdownText.height - 30; // 30 is the margin between the countdown number and the batContainer

  // Add the texts to the gameScene
  gameScene.addChild(labelText);
  gameScene.addChild(countdownText);
}

function getRandomWeed() {
  const randomIndex = Math.floor(Math.random() * weedKeys.length);
  const weed = new Sprite(weeds[weedKeys[randomIndex]]);

  weed.interactive = true;
  weed.buttonMode = true; // Changes the cursor to a hand when hovering over the sprite

  weed.on('pointerdown', () => {
    batContainer.removeChild(weed); // Remove the weed from the container when clicked
  });

  return weed;
}

function spawnWeed() {
  const randomColumn = Math.floor(Math.random() * 4); // as you have 4 columns
  const randomRow = Math.floor(Math.random() * 6); // as you have 6 rows

  const weed = getRandomWeed();
  weed.width = batSize;
  weed.height = batSize;
  weed.x = batSize * randomColumn;
  weed.y = batSize * randomRow;
  
  // Initialize a timer for this weed
  weed.timer = 0;
  weed.column = randomColumn;
  weed.row = randomRow;

  // Attach a listener to the weed to handle removals (when it's clicked).
  weed.on('pointerdown', () => {
    batContainer.removeChild(weed); // Remove the weed from the container when clicked
  });
  
  batContainer.addChild(weed);
}

function findCorrespondingCorn(column, row) {
  if(column < 0 || column >= numberOfCol || row < 0 || row >= numberOfRows) {
    console.error("Invalid column or row");
    return null;
  }
  return cornSprites[column][row];
}

function switchToNextSpriteSheet() {
  currentSpriteSheetIndex = (currentSpriteSheetIndex + 1) % cornSpriteSheets.length;
  // update frames for all cornAni1 instances on the stage.
  batContainer.children.forEach((child) => {
    if (child instanceof PIXI.AnimatedSprite) {
      const frames = getCornFrames(cornSpriteSheets[currentSpriteSheetIndex]);
      child.textures = frames;
      child.gotoAndPlay(0);
    }
  });
}

function getCornFrames(spriteSheetTexture) {
  const totalFrames = 2;
  const singleFrameWidth = spriteSheetTexture.baseTexture.width / totalFrames;
  const frames = [];

  for (let i = 0; i < totalFrames; i++) {
    const frame = new PIXI.Rectangle(singleFrameWidth * i, 0, singleFrameWidth, spriteSheetTexture.baseTexture.height);
    const textureFrame = new PIXI.Texture(spriteSheetTexture.baseTexture, frame);
    frames.push(textureFrame);
  }

  return frames;
}


function gameLoop(delta) {
  // Runs the current game `state` in a loop and renders the sprites
  play(delta);

  if (countdownTime <= 0) {
    end();
  }
}

function play(delta) {
  // All the game logic goes here
  const currentTime = Date.now();
  const deltaTime = (currentTime - lastTime) / 1000;
  // countdown logic
  countdownTime -= deltaTime;

  if (countdownTime <= 0) {
    countdownTime = 0;
  }
  countdownText.text = Math.floor(countdownTime).toString();

  lastTime = currentTime;

  if (countdownTime <= 100 && countdownTime >= 70) {
    if (Math.random() < 0.01) { // 1% chance every frame
      spawnWeed();
    }
  }

  if (countdownTime <= 70 && countdownTime >= 30) {
    if (Math.random() < 0.03) {
      generateBugs();
    }
  }

  if (countdownTime <= 30 && countdownTime >= 0) {
    if (Math.random() < 0.03) {
      generateAnimals();
    }
  }

  handleCollisions();

  accumulatedTime += deltaTime;
  if (accumulatedTime >= 20) {
    switchToNextSpriteSheet();
    accumulatedTime -= 20; // reset the accumulated time or subtract 20 from it
  }
  
  // Handle Weed timers
  batContainer.children.forEach(child => {
    if (child.timer !== undefined) {
      child.timer += deltaTime;
      if (child.timer > 1) {
        let correspondingCorn = findCorrespondingCorn(child.column, child.row);
        if (correspondingCorn) {
          overlayGlitch(correspondingCorn, 'Corn_fail01@2x.png'); // For weed scenario
          batContainer.removeChild(child);
        }
      }
    }
  });
}




function checkCollision(sprite, targetSprite) {
  if (!(sprite instanceof PIXI.Sprite) || !(targetSprite instanceof PIXI.Sprite)) {
    return false;
  }

  const spriteBounds = sprite.getBounds();
  const spotBounds = targetSprite.getBounds();

  return spriteBounds.x + spriteBounds.width > spotBounds.x
           && spriteBounds.x < spotBounds.x + spotBounds.width
           && spriteBounds.y + spriteBounds.height > spotBounds.y
           && spriteBounds.y < spotBounds.y + spotBounds.height;
}

function handleCollisions() {
   app.stage.children.forEach((child) => {
    if (child instanceof PIXI.Sprite && child.vx && child.vy) {
      let hasCollided = false;

      for (let i = batContainer.children.length - 1; i >= 0; i--) {
        const currentCorn = batContainer.children[i];
        if (!currentCorn.isFilled
       && (currentCorn.isLeftmost || currentCorn.isRightmost || currentCorn.isUppermost || currentCorn.isBottommost)
       && checkCollision(child, currentCorn)) {
          
          currentCorn.isFilled = true;
          hasCollided = true;
          child.vx = 0; // Stop sprite from moving in x direction
          child.vy = 0; // Stop sprite from moving in y direction
          child.isCollided = true;

          overlayGlitch(currentCorn,'Corn_fail02@2x.png');
          batContainer.removeChild(currentCorn); // Remove the corn sprite from the container

         
          // Glitch effect after 2 seconds if still in contact
          setTimeout(() => {
            if (checkCollision(child, currentCorn)) {
              currentCorn.isFilled = true;
              overlayGlitch(currentCorn);
              batContainer.removeChild(currentCorn);
            }
          }, 2000); 
          break;
        }
      }
      
      // If no collision occurred, continue moving the sprite
      if (!hasCollided) {
        child.x += child.vx * child.speed;
        child.y += child.vy * child.speed;
      }
    }
  });
}

function pushSpriteAway(event) {
  const sprite = event.currentTarget;
  sprite.interactive = true; // Re-enable interactivity
  sprite.isCollided = false; // Reset collision flag

  const interactionData = event.data;
  const globalPosition = interactionData.global;

  const dx = globalPosition.x - sprite.x;
  const dy = globalPosition.y - sprite.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  const pushForce = 10; 
  sprite.vx = -(dx / distance) * pushForce;
  sprite.vy = -(dy / distance) * pushForce;
}

function overlayGlitch(cornSprite,textureName) {
 // const overlay = new Sprite(cornfail['Corn_fail02@2x.png']);
  const overlay=new Sprite(cornfail[textureName]);
  overlay.width = cornSprite.width;
  overlay.height = cornSprite.height;
  overlay.x = cornSprite.x;
  overlay.y = cornSprite.y;

  batContainer.addChild(overlay);
  cornSprite.interactive=false;
   score -= 4;
  console.log("score:", score);
}

function generateBugs() {
  // randomly select which animation to use
  
  
  const randomBugAni = Math.random() < 0.5 ? beeFrames : mothFrames;
  // Get all frame names from the selected animation
  const frameNames = Object.keys(randomBugAni);
  // convert frame names to textures
  const frames = frameNames.map((name) => randomBugAni[name]);

  // create an animated spirte with the chosen frames
  const sprite = new PIXI.AnimatedSprite(frames);
  sprite.animationSpeed = 0.3;
  sprite.play();
  // sprite.scale.set(0.6);
  sprite.isCollided = false;

  // Randomly position the sprite on the canvas
  const randomSide = Math.floor(Math.random() * 4);
  switch (randomSide) {
    case 0: // top
      sprite.x = Math.random() * app.view.width;
      sprite.y = 0;
      break;
    case 1: // right
      sprite.x = app.view.width;
      sprite.y = Math.random() * app.view.height;
      break;
    case 2: // bottom
      sprite.x = Math.random() * app.view.width;
      sprite.y = app.view.height;
      break;
    case 3: // left
      sprite.x = 0;
      sprite.y = Math.random() * app.view.height;
      break;
  }

  // Calculate the direction towards the center of the canvas
  const directionX = app.view.width / 2 - sprite.x;
  const directionY = app.view.height / 2 - sprite.y;
  const length = Math.sqrt(directionX * directionX + directionY * directionY);
  sprite.vx = directionX / length;
  sprite.vy = directionY / length;

  // Set a random speed
  sprite.speed = Math.random() * 3 + 2; // Random speed between 2 to 5

  app.stage.addChild(sprite);

  sprite.interactive = true;
  sprite.on('pointerdown', pushSpriteAway);

  return sprite;
}

function generateAnimals() {
  console.log('animal time!');
  const walkingRight = Math.random() < 0.5;
  const randomAnimalIndex = Math.floor(Math.random() * 3);

  let animationTextures;
  if (walkingRight) {
    switch (randomAnimalIndex) {
      case 0: animationTextures = walkingRightTextures1; break;
      case 1: animationTextures = walkingRightTextures2; break;
      case 2: animationTextures = walkingRightTextures3; break;
    }
  } else {
    switch (randomAnimalIndex) {
      case 0: animationTextures = walkingLeftTextures1; break;
      case 1: animationTextures = walkingLeftTextures2; break;
      case 2: animationTextures = walkingLeftTextures3; break;
    }
  }

  const frames = Object.keys(animationTextures).map((name) => animationTextures[name]);
  const sprite = new PIXI.AnimatedSprite(frames);
  sprite.animationSpeed = 0.1;
  sprite.play();
  sprite.isCollided = false;

  if (walkingRight) {
    sprite.x = 0;
    sprite.vx = 1; // Move right
  } else {
    sprite.x = app.view.width - sprite.width;
    sprite.vx = -1; // Move left
  }
  sprite.y = Math.random() * (app.view.height - sprite.height);

  sprite.speed = Math.random() * 3 + 2;

  app.stage.addChild(sprite);

  sprite.interactive = true;
  sprite.on('pointerdown', pushSpriteAway);

  return sprite;
}




function createGameOverScene() {
  gameOverScene = new Container();
  app.stage.addChild(gameOverScene);
  gameOverScene.visible = false;
  GameoverText = new PIXI.Text(
    'Game Over!',
    { fontFamily: 'Arial', fontSize: 50, fill: 'black' },
  );
  GameoverText.x = app.view.width / 2 - GameoverText.width / 2;
  GameoverText.y = app.view.height / 2;
  gameOverScene.addChild(GameoverText);
}


function exitGame() {
  console.log('exitgame');
  common.completeStage('02');
}

function end() {
  app.ticker.remove(gameLoop);
  gameScene.visible = false;
  gameOverScene.visible = true;
  GameoverText.visible = true;
  console.log('Game OVER!');
  app.ticker.stop();
  setTimeout(() => {
    restartGame();
  }, 1000); // 1 second delay
}

function restartGame() {
  console.log('restartGame');
  // Clear the main game scene and the bat container
  app.stage.removeChildren();
  // Add gameScene and batContainer back to the stage if they aren't already
  if (!app.stage.children.includes(gameScene)) {
    app.stage.addChild(gameScene);
  }
  if (!gameScene.children.includes(batContainer)) {
    gameScene.addChild(batContainer);
  }
  // Re-create any initial game objects or UI components
  createCountdown();
  createBat();
  createRetryButtons();
  createYesorNoButtons();

  createGameOverScene();

  // Reset the game timer
  countdownTime = 100;

  // Set the visibility of game scenes
  gameScene.visible = true;
  gameOverScene.visible = false;

  // Reset the game state to the play function
  state = play;

  // Ensure gameLoop is removed from the ticker to prevent duplicate additions
  app.ticker.remove(gameLoop);

  // Add the game loop back and start the ticker
  app.ticker.add(gameLoop);
  app.ticker.start();
}
function resumeYes() {
  ecoPoint--;
  resume();
}
function resumeNo() {
  ecoPoint++;
  resume();
}
function resume() {
  app.ticker.start();
}
function createRetryButtons() {
  retryButton = new PIXI.Graphics();
  exitButton = new PIXI.Graphics();

  retryButton.beginFill(0xFF3300); // color of the button
  retryButton.drawRoundedRect(0, 0, 150, 50, 10); // width, height, and corner radius of the button
  retryButton.endFill();

  exitButton.beginFill(0xFF3300); // color of the button
  exitButton.drawRoundedRect(0, 0, 150, 50, 10); // width, height, and corner radius of the button
  exitButton.endFill();

  retryButton.interactive = true;
  retryButton.buttonMode = true;
  retryButton.on('pointerdown', restartGame);

  exitButton.interactive = true;
  exitButton.buttonMode = true;
  exitButton.on('pointerdown', exitGame);

  // Optionally add text labels to the buttons
  const retryText = new PIXI.Text('Retry', { fontFamily: 'Arial', fontSize: 24, fill: 0xffffff });
  const exitText = new PIXI.Text('Exit', { fontFamily: 'Arial', fontSize: 24, fill: 0xffffff });

  retryText.position.set((retryButton.width - retryText.width) / 2, (retryButton.height - retryText.height) / 2);
  exitText.position.set((exitButton.width - exitText.width) / 2, (exitButton.height - exitText.height) / 2);

  retryButton.addChild(retryText);
  exitButton.addChild(exitText);

  // Initially set them invisible
  retryButton.visible = false;
  exitButton.visible = false;

  // Add them to your stage
  app.stage.addChild(retryButton);
  app.stage.addChild(exitButton);
}

function createYesorNoButtons() {
  YesButton = new PIXI.Graphics();
  NoButton = new PIXI.Graphics();

  YesButton.beginFill(0xFF3300); // color of the button
  YesButton.drawRoundedRect(0, 0, 150, 50, 10); // width, height, and corner radius of the button
  YesButton.endFill();

  NoButton.beginFill(0xFF3300); // color of the button
  NoButton.drawRoundedRect(0, 0, 150, 50, 10); // width, height, and corner radius of the button
  NoButton.endFill();

  YesButton.interactive = true;
  YesButton.buttonMode = true;
  YesButton.on('pointerdown', resumeYes);

  NoButton.interactive = true;
  NoButton.buttonMode = true;
  NoButton.on('pointerdown', resumeNo);

  // Optionally add text labels to the buttons
  const YesText = new PIXI.Text('네', { fontFamily: 'Arial', fontSize: 24, fill: 0xffffff });
  const NoText = new PIXI.Text('아니오', { fontFamily: 'Arial', fontSize: 24, fill: 0xffffff });

  YesText.position.set((YesButton.width - YesText.width) / 2, (YesButton.height - YesText.height) / 2);
  NoText.position.set((NoButton.width - NoText.width) / 2, (NoButton.height - NoText.height) / 2);

  YesButton.addChild(YesText);
  NoButton.addChild(NoText);

  // Initially set them invisible
  YesButton.visible = false;
  NoButton.visible = false;

  // Add them to your stage
  app.stage.addChild(YesButton);
  app.stage.addChild(NoButton);
}
function showButtons() {
  // show buttons
  retryButton.position.set(app.screen.width / 2 - retryButton.width / 2, app.screen.height / 2);
  exitButton.position.set(app.screen.width / 2 - exitButton.width / 2, retryButton.y + retryButton.height + 10);

  retryButton.visible = true;
  exitButton.visible = true;
}

function showYesorNoButtons() {
  YesButton.position.set(app.screen.width / 2 - YesButton.width / 2, app.screen.height / 2);
  NoButton.position.set(app.screen.width / 2 - NoButton.width / 2, YesButton.y + YesButton.height + 10);

  YesButton.visible = true;
  NoButton.visible = true;
}