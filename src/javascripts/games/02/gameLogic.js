import * as PIXI from 'pixi.js';

import {
  app, Container, Sprite, TextureCache, Graphics, resources, resolution,
} from './init.js';
import { stageSentences } from './texts.js';

import { common } from '../../common.js';

let countdownText; let id; let soils; let bgSprites; let batContainer; let gameScene; let gameOverScene; let GameoverText; let state; let bg; let cornfail;
let countdownTime = 100;
let lastTime = Date.now();
let cornSprite1; let cornSprite2; let cornSprite3; let cornSprite4; let cornSprite5; let cornAni1; let cornSpriteSheets; let beeFrames; let mothFrames; let walkingRightTextures1; let walkingRightTextures2; let walkingRightTextures3; let walkingLeftTextures1; let walkingLeftTextures2; let walkingLeftTextures3;
let scale; let batSize; let weeds; let weedKeys; let guideBox; let guideText; let gameStage=1;
// 밭 한칸당 4점 x 24 = 96점
let score = 96;
let ecoPoint = 0;
let previousGameStage = null; // Initializing to null as there is no previous stage at the start.

// Assuming your 750px wide window fits 4 columns with 60 spacing in portrait
const baseWindowWidth = 750 / 2;

scale = app.view.width / baseWindowWidth;

const baseBatSize = 30; // Original rectangle size

batSize = baseBatSize * scale;

let currentSpriteSheetIndex = 0;
let accumulatedTime = 0;
let numberOfCol=4; let numberOfRows=6; let cornSprites=[];

const currentMessage = {
  type: 'guide',
  index: 0,
  interval: null,
};

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
  CreateGuideConsole();
  createCountdown();
  createGameOverScene();
  
  state = play;

  app.ticker.add(gameLoop);
}

function CreateGuideConsole(){
    if (!stageSentences[gameStage]) {
    console.error(`no sentences found for stage ${gameStage}`);
    return;
  }
  const sentences = stageSentences[gameStage];
  if (guideBox) {
    gameScene.removeChild(guideBox);
    guideBox = null;
  }
  guideBox=new PIXI.Graphics();
  guideBox.beginFill(0xFFFFFF);
  guideBox.drawRoundedRect(0, 0, batContainer.width * 1.2, (app.view.height / resolution) / 10, 20);
  guideBox.endFill();
  guideBox.x = ((app.view.width / resolution) - guideBox.width) / 2;
  guideBox.y = (app.view.height / resolution) / 10;
  guideBox.zIndex=1;
  gameScene.addChild(guideBox);
  gameScene.children.sort((a, b) => a.zIndex - b.zIndex); // Sort after adding a new child

  
   const baseSize = 40; // This is your base font size for a known screen size, e.g., 800px width
  const baseScreenWidth = 800; // The screen width you designed for
  const currentScreenWidth = window.innerWidth; // Get current screen (viewport) width
  const dynamicFontSize = (currentScreenWidth / baseScreenWidth) * baseSize;
  guideText = new PIXI.Text(sentences[0], { fontFamily: "Neo둥근모", fontSize: dynamicFontSize, fill: '#000000', wordWrap: true, wordWrapWidth: batContainer.width * 1.3 });
  guideText.anchor.set(0.5);
  guideText.x = guideBox.width / 2;
  guideText.y = guideBox.height / 2;
  guideBox.addChild(guideText);
  const currentStageAtStart = gameStage;
  // Display each sentence sequentially every second
  let index = 1; // starting from the second sentence since the first one is already displayed
  const interval = setInterval(() => {
    if (gameStage != currentStageAtStart) { // If the game stage has changed, stop the loop and exit
      clearInterval(interval);
      return;
    }
    guideText.text = sentences[index];
    index++;

    if (index >= sentences.length) {
      if (gameStage === 0) {
        clearInterval(interval);
        gameStage = 1;
        CreateGuideConsole();
      } else if (gameStage === 1 || gameStage === 2 || gameStage === 3) {
        index = 0;
      }
    }
  }, 2000);
}

function createBat() {
 
  
  const cornFrames = getCornFrames(cornSpriteSheets[currentSpriteSheetIndex]);
  batContainer = new Container();
  cornSprites = new Array(numberOfCol).fill(null).map(() => new Array(numberOfRows).fill(null));

   const batPlain=new Sprite(soils['soil_plain03@3x.png']);
  batPlain.width=batSize *numberOfCol;
  batPlain.height=batSize*numberOfRows;
  batContainer.addChild(batPlain);
  
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
      cornAni1.isFailed=false;
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
  batContainer.y = ((app.view.height / resolution) - batContainer.height) / 2+45;
  gameScene.addChild(batContainer);
 

}
function createCountdown() {
  if (countdownText) {
    gameScene.removeChild(countdownText);
    countdownText = null;
  }
   const circle = new PIXI.Graphics();
    circle.beginFill(0x58bfff); 
    circle.drawCircle(0, 0, 60); // Change 40 to the radius you desire
    circle.endFill();
    
     // Position the circle
    circle.x = (app.view.width / resolution) * 0.8;
    circle.y = (app.view.height / resolution) / 10;
    
  let labelText=new PIXI.Text('Time Left: ', {fontFamily:'Neo둥근모', fontSize:36, fill: 'black'});
  countdownText = new PIXI.Text('100', { fontFamily: 'Neo둥근모', fontSize: 50, fill: 'white' });

  
  labelText.x= ((app.view.width / resolution) - batContainer.width) / 2;
  countdownText.x=(app.view.width / resolution)*0.8;
  labelText.y =((app.view.height / resolution) - batContainer.height) / 2
  countdownText.y =(app.view.height / resolution)/10;
  circle.zIndex=2;
  countdownText.zIndex=2;
  gameScene.addChild(circle);
   gameScene.addChild(countdownText);   
   gameScene.children.sort((a, b) => a.zIndex - b.zIndex); // Sort after adding new children

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

 // Update gameStage based on countdownTime
    if (countdownTime <= 100 && countdownTime >= 70) gameStage = 1;
    else if (countdownTime <= 70 && countdownTime >= 30) gameStage = 2;
    else if (countdownTime <= 30 && countdownTime >= 0) gameStage = 3;
    
      // Handle stage change
    if (previousGameStage !== gameStage) {
        handleStageChange(previousGameStage, gameStage);
        previousGameStage = gameStage; // Update previousGameStage after handling the change
    }
     // Continue with other game logics like handling collisions, spawning entities, etc.
    handleCollisions();
    accumulatedTime += deltaTime;
    
      if (gameStage === 1 && Math.random() < 0.01) spawnWeed();
    if (gameStage === 2 && Math.random() < 0.03) generateBugs();
    if (gameStage === 3 && Math.random() < 0.03) generateAnimals();

  handleCollisions();

  accumulatedTime += deltaTime;
  if (accumulatedTime >= 40) {
    switchToNextSpriteSheet();
    accumulatedTime -= 40; // reset the accumulated time or subtract 20 from it
  }
  
  // Handle Weed timers
  batContainer.children.forEach(child => {
    if (child.timer !== undefined) {
      child.timer += deltaTime;
      if (child.timer > 1) {
        let correspondingCorn = findCorrespondingCorn(child.column, child.row);
        if (correspondingCorn) {
         // Create new failed corn sprite
        const failedCorn = new Sprite(cornfail['Corn_fail01@2x.png']);
        
        failedCorn.x = correspondingCorn.x;
        failedCorn.y = correspondingCorn.y;
        failedCorn.width = correspondingCorn.width;
        failedCorn.height = correspondingCorn.height;
        failedCorn.isFailed=true;  // <-- HERE, marking the newly created failed corn sprite as failed
        
        // Remove old corn sprite and add the new one
        batContainer.removeChild(correspondingCorn);
        batContainer.addChild(failedCorn);
        cornSprites[child.column][child.row] = failedCorn;  // Update the reference in cornSprites array
        
        batContainer.removeChild(child);  // Remove the weed
        }
      }
    }
  });
  
  
}

function handleStageChange(fromStage, toStage) {
    // Here, perform any setup or teardown needed when the game stage changes.
    // For example, you might want to reset timers, or clear entities, or update the guide console, etc.
    CreateGuideConsole(); // For example, updating the Guide Console when the stage changes.
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
      
      // Assuming cornSprites is a 2D array holding all your corn sprites.
      for (let i = 0; i < cornSprites.length; i++) {
        for (let j = 0; j < cornSprites[i].length; j++) {
          const currentCorn = cornSprites[i][j];
          
        
              if (!currentCorn.isFailed && !currentCorn.isFilled && checkCollision(child, currentCorn)) {


              currentCorn.isFilled = true;
              hasCollided = true;
              
              // Stop sprite from moving
              child.vx = 0; 
              child.vy = 0; 
              child.isCollided = true;
              
              cornFail(currentCorn, 'Corn_fail02@2x.png');
              
              // Remove the corn sprite from the container
              batContainer.removeChild(currentCorn); 
              
              // If still in contact after 2 seconds, apply cornFail again
              setTimeout(() => {
                if (checkCollision(child, currentCorn)) {
                  currentCorn.isFilled = true;
                  cornFail(currentCorn); 
                  batContainer.removeChild(currentCorn);
                }
              }, 2000); 
              
              break;
          }
        }
        if(hasCollided) break; // exit the outer loop as well if a collision has been detected
      }
      
      // If no collision occurred, continue moving the sprite
      if (!hasCollided) {
        child.x += child.vx * child.speed;
        child.y += child.vy * child.speed;
      }
    }
  });
}

function cornFail(cornSprite,textureName) {
  const replace=new Sprite(cornfail[textureName]);
  replace.width = cornSprite.width;
  replace.height = cornSprite.height;
  replace.x = cornSprite.x;
  replace.y = cornSprite.y;

  batContainer.addChild(replace);
  cornSprite.interactive=false;
  cornSprite.isFailed=true;
   score -= 4;
 // console.log("score:", score);
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
  sprite.animationSpeed = 0.3;
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
  
    if(!walkingRight){
    console.log('left-moving',sprite);
  }
  
  
  return sprite;
  

}


function switchToNextSpriteSheet() {
  if (currentSpriteSheetIndex < cornSpriteSheets.length - 1) {
    currentSpriteSheetIndex++;

    // update frames for all cornAni1 instances on the stage.
    batContainer.children.forEach((child) => {
      if (child instanceof PIXI.AnimatedSprite) {
        const frames = getCornFrames(cornSpriteSheets[currentSpriteSheetIndex]);
        child.textures = frames;
        child.gotoAndPlay(0); // restarts the animation from the first frame
      }
    });
  }
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

function createGameOverScene() {
  gameOverScene = new Container();
  app.stage.addChild(gameOverScene);
  gameOverScene.visible = false;
  GameoverText = new PIXI.Text(
    'Game Over!',
    { fontFamily: 'Neo둥근모', fontSize: 50, fill: 'black' },
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
