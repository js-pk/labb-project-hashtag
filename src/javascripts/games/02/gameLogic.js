import * as PIXI from 'pixi.js';
import {
  app, Container, Sprite, TextureCache, Graphics, resources, resolution,
} from './init.js';
const stageSentences = translation.GAME_02_SENTENCES;

import { common } from '../../common.js';

let countdownText; let soils; let batContainer; let gameScene; let state; let bg; let cornfail; let badbugFrames; let hasResetCollisions=false; let click;
let countdownTime = 100; let startButton; let counting=false; let clickAnimation;
let lastTime=Date.now();
let cornSprite1; let cornSprite2; let cornSprite3; let cornSprite4; let cornSprite5; let cornAni1; let cornSpriteSheets; let beeFrames; let mothFrames; let walkingRightTextures1; let walkingRightTextures2; let walkingRightTextures3; let walkingLeftTextures1; let walkingLeftTextures2; let walkingLeftTextures3;
let scale; let batSize; let weeds; let weedKeys; let guideBox; let guideText; let gameStage=1; let isPopup1Generated=false; let isPopup2Generated=false; 
let shouldSpawnWeeds=true; let shouldGenerateBugs=true; let shouldSpawnBees=true;
let popupSound; 
// 밭 한칸당 4점 x 24 = 96점
let score = 96;
let ecoPoint = 0;
let previousGameStage = null; // Initializing to null as there is no previous stage at the start.
let isGamePaused=false;
// Assuming your 750px wide window fits 4 columns with 60 spacing in portrait
const baseWindowWidth = 750 / 2;

scale = app.view.width / baseWindowWidth;

const baseBatSize = 60; // Original rectangle size

batSize = baseBatSize * scale / resolution;

let currentSpriteSheetIndex = 0;
let accumulatedTime = 0;
let numberOfCol=4; let numberOfRows=6; let cornSprites=[];

const sounds={
   bugPush: new Howl({
      src:['/sound/S_bugkill.mp3']}),
  success:new Howl({
    src:['/sound/S_success.mp3']}),
  popup: new Howl({
    src:['/sound/S_popup.mp3']
  })
};


export function setup() {

  cornSprite1 = resources['/images/sprites/2/corn01.png'].texture;
  cornSprite2 = resources['/images/sprites/2/corn02.png'].texture;
  cornSprite3 = resources['/images/sprites/2/corn03.png'].texture;
  cornSprite4 = resources['/images/sprites/2/corn04.png'].texture;
  cornSprite5 = resources['/images/sprites/2/corn05.png'].texture;
  cornSpriteSheets = [cornSprite1, cornSprite2, cornSprite3, cornSprite4, cornSprite5];

  beeFrames = resources['/images/sprites/2/bees-spritesheet.json'].textures;
  mothFrames = resources['/images/sprites/2/moth-spritesheet.json'].textures;
  badbugFrames=resources['/images/sprites/2/badbug-spritesheet.json'].textures;

  walkingRightTextures1 = resources['/images/sprites/2/crow_from_left.json'].textures;
  walkingRightTextures2 = resources['/images/sprites/2/waterDeer_from_left.json'].textures;
  walkingRightTextures3 = resources['/images/sprites/2/boar_fromLeft.json'].textures;
  walkingLeftTextures1 = resources['/images/sprites/2/crow_from_right.json'].textures;
  walkingLeftTextures2 = resources['/images/sprites/2/waterDeer_from_Right.json'].textures;
  walkingLeftTextures3 = resources['/images/sprites/2/boar_fromRight.json'].textures;
  soils = resources['/images/sprites/soils.json'].textures;
  weeds = resources['/images/sprites/2/weeds.json'].textures;
  cornfail = resources['/images/sprites/2/corn-fail.json'].textures;
//  click= resources['/images/sprites/click-tab.json'].textures;
  weedKeys = Object.keys(weeds);

  gameScene = new Container();
  app.stage.addChild(gameScene);

  createStartButton();
  gameScene.alpha=0.3;
  createBat();
  CreateGuideConsole();
  createCountdown();
  isGamePaused=true;
  
  state = play;

  app.ticker.add(gameLoop);
}


function gameLoop(delta) {
  // Runs the current game `state` in a loop and renders the sprites
  play(delta);
}

function play(delta) {
    if(isGamePaused) return; // Stops the execution of play function when the game is paused
 
  if(counting && countdownTime>0){
    countdownTime -= 0.02*delta;
  }
   if (countdownTime <= 0) {
    countdownTime = 0;
    checkFinalScore();
  }
  countdownText.text = Math.floor(countdownTime).toString();

  updateGameStage();
  updateAnimations(delta);
  handleCollisions();
   spawnEntities();
   handlePopupsAndTimers(delta);
 
  if(gameStage===3 &&!hasResetCollisions){
    resetCollisions();
    hasResetCollisions=true;
  }
}

function restartGame() {
  console.log('restartGame');
  isGamePaused= false;
  
  app.stage.removeChildren();
  
  app.ticker.remove(gameLoop);
  app.ticker.add(gameLoop);
  // Reset variables and states
  countdownTime = 100;
 // lastTime = Date.now();
  gameStage = 1;
  
  // Add gameScene and batContainer back to the stage if they aren't already
  app.stage.addChild(gameScene);
  
  if (batContainer) {
    gameScene.addChild(batContainer);

    batContainer.children.forEach((child) => {
      if (child instanceof PIXI.AnimatedSprite) {
        child.gotoAndPlay(0); // resets the animation to the first frame
      }
    });
  }

  // Re-create any initial game objects or UI components
  CreateGuideConsole();
  createCountdown();
  currentSpriteSheetIndex = 0;
  createBat();
 
  // Reset other game flags
  isPopup1Generated = false; 
  isPopup2Generated = false;
  shouldGenerateBugs = false;
  shouldSpawnBees = true;
  shouldSpawnWeeds = true;
  hasResetCollisions = false;

  // Reset the game state to the play function
  state = play;

  // Add the game loop back and start the ticker
//  app.ticker.add(gameLoop);
  if (!app.ticker.started) app.ticker.start();
  console.log(`countdownTime: ${countdownTime}, lastTime: ${lastTime}`);

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
      cornAni1.y = batSpot.y-30;
      cornAni1.animationSpeed = 0.1;
      cornAni1.play();

      batContainer.addChild(cornAni1);
      
      cornSprites[i][j] = cornAni1; // populate the array with the corn sprite references
    }
  }

  batContainer.x = ((app.view.width / resolution) - batContainer.width) / 2;
  batContainer.y = ((app.view.height / resolution) - batContainer.height) / 2+70;
  gameScene.addChild(batContainer);
}
function createStartButton(){
  // Create a button using PIXI Graphics
startButton = new PIXI.Graphics();
startButton.beginFill(0x0330fc); // #0330fc
startButton.drawRoundedRect(0, 0, 150*2, 50*2,20*2); // Draw the rectangle
startButton.endFill();

// Add text to the button
let buttonText = new PIXI.Text('START', {fontFamily : 'Neo둥근모', fontSize: 24*2, fill : 0xFFFFFF, align : 'center'});
buttonText.x = startButton.width / 2;
buttonText.y = startButton.height / 2;
buttonText.anchor.set(0.5, 0.5); // Center the text on the button
startButton.addChild(buttonText);

// Position the button in the middle of the screen
startButton.x = (app.view.width /resolution- startButton.width) / 2;
startButton.y = (app.view.height/resolution - startButton.height) / 2;

// Make it interactive
startButton.interactive = true;
startButton.buttonMode = true;

// Add click and tap event handlers
startButton.on('pointerdown', onStartButtonClick);

// Add the button to the stage
app.stage.addChild(startButton);

const clickFrames=getClickFrames();
clickAnimation=new PIXI.AnimatedSprite(clickFrames);
clickAnimation.x= startButton.x+startButton.width/2;
clickAnimation.y=startButton.y;
clickAnimation.animationSpeed=0.1;
clickAnimation.loop=true;
app.stage.addChild(clickAnimation);
clickAnimation.play();

}
function getClickFrames(){
  const clickTextureAtlas = resources['/images/sprites/click-tab.json'].textures;
  const frames = Object.keys(clickTextureAtlas).map(frameKey => clickTextureAtlas[frameKey]);
  return frames;
}


function onStartButtonClick() {
  let startSound = new Howl({
    src: ['/sound/S_levelStart.mp3'],
  });
  startSound.play(); // Play sound after a user gesture (click)
  clickAnimation.stop();
  clickAnimation.visible=false;

  gameScene.interactive=true;
  gameScene.visible=true;
  gameScene.alpha=1;
  counting=true;
  isGamePaused=false;
  startButton.visible=false;
  setTimeout(() => {
    gameStage = 1; // Set gameStage to 1 after displaying 'START'
    if (stageSentences[1] && stageSentences[1].length > 0) {
      guideText.text = stageSentences[1][0];
      startSentenceDisplayInterval(stageSentences[1]); // Start displaying the sentences
    } else {
      console.error('No sentences found for stage 1');
    }
  }, 2000);
}
function CreateGuideConsole(){
  
  
    if (!stageSentences[gameStage]) {
    console.error(`no sentences found for stage ${gameStage}`);
    return;
  }
  const sentences = stageSentences[gameStage];
  startSentenceDisplayInterval(sentences);
  if (guideBox) {
    gameScene.removeChild(guideBox);
    guideBox = null;
  }
  guideBox=new PIXI.Graphics();
  guideBox.beginFill(0xFFFFFF);
  guideBox.drawRoundedRect(0, 0, batContainer.width * 1.5, (app.view.height / resolution) / 8, 16);
  guideBox.endFill();
  guideBox.x = ((app.view.width / resolution) - guideBox.width) / 2;
  guideBox.y = (app.view.height / resolution) / 11;
  guideBox.zIndex = 99;
  gameScene.addChild(guideBox);
  gameScene.children.sort((a, b) => a.zIndex - b.zIndex); // Sort after adding a new child

  
  const baseSize = 40; // This is your base font size for a known screen size, e.g., 800px width
  const baseScreenWidth = 800; // The screen width you designed for
  const currentScreenWidth = window.innerWidth; // Get current screen (viewport) width
  const dynamicFontSize = (currentScreenWidth / baseScreenWidth) * baseSize;
  guideText = new PIXI.Text(sentences[0], { fontFamily: "Neo둥근모", fontSize: dynamicFontSize*2, fill: '#000000', wordWrap: true, wordWrapWidth: batContainer.width * 1.1 });
  guideText.anchor.set(0.5);
  guideText.x = guideBox.width / 2;
  guideText.y = guideBox.height / 2;
  guideBox.addChild(guideText);

}

function startSentenceDisplayInterval(sentences){
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

function createCountdown() {
  if (countdownText) {
    gameScene.removeChild(countdownText);
    countdownText = null;
  }
   const circle = new PIXI.Graphics();
    circle.beginFill(0x58bfff); 
    circle.drawCircle(0, 0, 45); 
    circle.endFill();
    
     // Position the circle
    circle.x = (app.view.width / resolution) * 0.9;
    circle.y = (app.view.height / resolution) / 6.1;
    
  let labelText=new PIXI.Text('Time Left: ', {fontFamily:'Neo둥근모', fontSize:36, fill: 'black'});
  countdownText = new PIXI.Text('100', { fontFamily: 'Neo둥근모', fontSize: 50, fill: 'white' });

  
  labelText.x= ((app.view.width / resolution) - batContainer.width) / 2;
  countdownText.x=(app.view.width / resolution)*0.865;
  labelText.y =((app.view.height / resolution) - batContainer.height) / 2
  countdownText.y =(app.view.height / resolution)/6.8;
  circle.zIndex=999;
  countdownText.zIndex=9999;
  gameScene.addChild(circle);
  gameScene.addChild(countdownText);   
  gameScene.children.sort((a, b) => a.zIndex - b.zIndex); // Sort after adding new children

}

function getRandomWeed() {
  const randomIndex = Math.floor(Math.random() * weedKeys.length);
  const weed = new Sprite(weeds[weedKeys[randomIndex]]);

  weed.interactive = true;
  weed.buttonMode = true; // Changes the cursor to a hand when hovering over the sprite

 let weedSound=new Howl({
   src:['/sound/S_weed.mp3'],
 });

  weed.on('pointerdown',function(){
     batContainer.removeChild(weed); 
     weedSound.play();
  })
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
  weed.lifetime=2000;
  weed.entityType='weed';
  // Attach a listener to the weed to handle removals (when it's clicked).
  weed.on('pointerdown', () => {
    batContainer.removeChild(weed); // Remove the weed from the container when clicked
  });
  
  batContainer.addChild(weed);
}
function getBeeFrames() {
  const beeTextureAtlas = resources['/images/sprites/2/bees-spritesheet.json'].textures;
  const frames = Object.keys(beeTextureAtlas).map(frameKey => beeTextureAtlas[frameKey]);
  return frames;
}
function spawnBees() {
  const randomColumn = Math.floor(Math.random() * 4);
  const randomRow = Math.floor(Math.random() * 6);
  
  const beeFrames = getBeeFrames(); // Getting frames from JSON spritesheet
  const bee = new PIXI.AnimatedSprite(beeFrames);
  
  // bee.width = batSize;
  // bee.height = batSize;
  bee.x = batSize * randomColumn;
  bee.y = batSize * randomRow;
  
  // Initialize properties for this bee
  bee.timer = 0;
  bee.column = randomColumn;
  bee.row = randomRow;
  bee.animationSpeed = 0.1; // You can adjust the animation speed as needed
  bee.play();
  bee.visible=true;
  bee.entityType='bee';
  bee.lifetime=500;
  batContainer.addChild(bee);
}
function switchToNextCornSpriteSheet() {
  if (currentSpriteSheetIndex < cornSpriteSheets.length - 1) {
    currentSpriteSheetIndex++;

    // update frames for all cornAni1 instances on the stage.
    batContainer.children.forEach((child) => {
      if (child instanceof PIXI.AnimatedSprite && child.entityType !=='bee') {
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


function findCorrespondingCorn(column, row) {
  if(column < 0 || column >= numberOfCol || row < 0 || row >= numberOfRows) {
    console.error("Invalid column or row");
    return null;
  }
  return cornSprites[column][row];
}

function updateAnimations(deltaTime){
 
 // const convertedDelta= delta/1000;
    //for animation
  accumulatedTime += deltaTime;
  const switchThreshold=900; //adjust this value to control speed
  if (accumulatedTime >= switchThreshold) {
    switchToNextCornSpriteSheet();
    accumulatedTime -=switchThreshold; // reset the accumulated time or subtract 20 from it
  }
}

function handlePopupsAndTimers(delta){

   
      // Handle Weed timers
  batContainer.children.forEach(child => {
    if (child.entityType==='weed'&& child.timer !== undefined) {
      child.timer += delta;
      if (child.timer > 100) {
        let correspondingCorn = findCorrespondingCorn(child.column, child.row);
        if (correspondingCorn) {
         // Create new failed corn sprite
        const failedCorn = new Sprite(cornfail['Corn_fail01@2x.png']);
        score -=2;
        console.log('score: ', score);
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
    }else if (child.entityType==='bee' && child.lifetime!== undefined){
      child.lifetime -= delta;
      if(child.lifetime <=0){
        child.visible=false;
      }
    } 
  });
}
function updateGameStage(){
  let newgameStage;
  // Update gameStage based on countdownTime
    if (countdownTime > 70) newgameStage = 1;
    else if (countdownTime > 30) newgameStage = 2;
    else if (countdownTime >0) newgameStage = 3;
    
      // Handle stage change
    if (previousGameStage !== newgameStage) {
       console.log('gameStage changed');
        gameStage= newgameStage;
        checkScore();
        handleStageChange(previousGameStage, gameStage);
        previousGameStage = gameStage; // Update previousGameStage after handling the change
    }
}
function checkScore(){

  switch(gameStage){
    case 1:
      
      break;
    case 2:
      handleScoreCheckForStage1();
      break;
    case 3:
      handleScoreCheckForStage2();
    default:
      console.error('unhandled game stage: ${gameStage}');
  }
}
function handleScoreCheckForStage1(){
 
  if(score >85 && !isPopup1Generated){
    generateJeChoJePopup();
  }
    if(score<=85 && !isPopup1Generated){
    weedFailPopup();
  }
}

function handleScoreCheckForStage2(){
  
  if(score>60 && !isPopup2Generated){
    generateNongYakPopup();
  }
  if(score<60 && !isPopup2Generated){
    bugFailPopup();
  }
}


function spawnEntities(){
     if (gameStage === 1 && Math.random() < 0.01 && shouldSpawnWeeds) spawnWeed();
    if (gameStage === 2 && Math.random() < 0.02 && shouldGenerateBugs) generateBugs();
    if (gameStage === 3 && Math.random() < 0.025) generateAnimals();
    if(gameStage ===2 && Math.random()< 0.01&&shouldSpawnBees) spawnBees();
}

function handleStageChange(fromStage, toStage) {
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
                console.log('collision happend between', child, 'and', currentCorn);
                currentCorn.isFilled = true;
                hasCollided = true;
              
              // Stop sprite from moving
              child.vx = 0; 
              child.vy = 0; 
              child.isCollided = true;
              
              if(child.vx===0 && child.vy ===0){
                setTimeout (() => {
                  if(checkCollision(child,currentCorn)){
                    cornFail(currentCorn, 'Corn_fail02@2x.png');
                    batContainer.removeChild(currentCorn);
                  }
                }, 2000);
              }
              
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
function resetCollisions() {
  app.stage.children.forEach((sprite) => {
    if (sprite instanceof PIXI.Sprite) {
      // Reset collision-related properties
      sprite.isCollided = false;
      sprite.isFailed = false;
      sprite.isFilled = false;
    }
  });
  
  cornSprites.flat().forEach((corn) => {
    corn.isFailed = false;
    corn.isFilled = false;
  });
}

function generateBugs() {
  
  // randomly select which animation to use
  const randomBugAni = Math.random() < 0.5 ? badbugFrames : mothFrames;
  
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
  sprite.isAnimal=true; //tag as animal
  sprite.animationSpeed = 0.3;
  sprite.play();
  sprite.isCollided = false;
  
    // Define initial position
  sprite.x = walkingRight ? 0 : app.view.width;
  sprite.y = Math.random() * app.view.height;

  // Define velocity components
  sprite.vx = walkingRight ? 1 : -1;  // Depending on whether it's walking right or left
  sprite.vy = Math.random() * 2 - 1;  // Random y velocity for some vertical movement
  
  // Define speed
  sprite.speed = Math.random() * 3 + 2; // Random speed between 2 to 5

  // Add to stage
  app.stage.addChild(sprite);
  
  // Optional: Interactive Events
  sprite.interactive = true;
  sprite.on('pointerdown', pushSpriteAway);

  return sprite;
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
  console.log("cornFail! score:", score);
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
  
  
  sounds.bugPush.play();
}



function generateJeChoJePopup(){
  common.addPopup({
                popupId: 'jechoPopup',
                title: translation.GAME_02_POPUP_POISON,
                content: null,
                imgURL: '/images/popup/5-2-1_success.png',
                buttons: [
                  {
                    title: translation.GAME_02_YES,
                    onclick: (event) => {
                      shouldSpawnWeeds=false;
                     generateWormPopup();
                    // app.ticker.start();
                    isGamePaused=false;
                 //   isPopup1Generated=true;
                     counting=true;
                    }
                },
                {
                  title: translation.GAME_02_NO,
                  onclick: (event) => {
                    common.hideAllPopup();
                    isGamePaused=false;
                   // isPopup1Generated=true;
                    ecoPoint++;
               //     app.ticker.start();
                    counting=true;
                  }
                }]    
            }, () => {
  //  app.ticker.stop();   
		 isGamePaused=true;
		 sounds.popup.play();
      counting=false;
      isPopup1Generated=true;
});
}

function generateWormPopup(){
  common.addPopup({
                popupId: 'WormPopup',
                title: translation.GAME_02_POPUP_WORM,
                content: null,
                imgURL: '/images/popup/earthworm_popup.png',
                buttons: [
                  {
                    title: translation.CONFIRM,
                    onclick: (event) => {
                      
                      common.hideAllPopup();
                      //resume the game
                     isGamePaused=false;
                     isPopup1Generated=true;
                    counting=true;
                  //   app.ticker.start();
                    }
                }]
  },() => {
    isGamePaused=true;
    sounds.popup.play();
//   app.ticker.stop();
    counting=false;
    
  });
}


function generateNongYakPopup(){
   common.addPopup({
                popupId: 'nongyakPopup',
                title: translation.GAME_02_POPUP_BUGKILLER,
                content: null,
                imgURL: '/images/popup/5-2-2_success.png',
                buttons: [
                  {
                    title: translation.GAME_02_YES,
                    onclick: (event) => {
                      shouldGenerateBugs=false;
                      shouldSpawnBees=false;
                     generateBeesGoodByePopUp();
                    //  app.ticker.start();
                      counting=true;
                      isGamePaused=false;
                    }
                },
                {
                  title: translation.GAME_02_NO,
                  onclick: (event) => {
                    common.hideAllPopup();
                    isGamePaused=false;
                    isPopup2Generated=true;
                    ecoPoint++; // app.ticker.start();
                    counting=true;
                  }
                }]    
            }, () => {
		 isGamePaused=true;
		sounds.popup.play();
    counting=false;
		// app.ticker.stop();
		isPopup2Generated=true;
});
}

function generateBeesGoodByePopUp(){
   common.addPopup({
                popupId: 'BeesPopup',
                title: translation.GAME_02_POPUP_BEE,
                content: null,
                imgURL: '/images/popup/beesgoodbye_popup.png',
                buttons: [
                  {
                    title: translation.CONFIRM,
                    onclick: (event) => {
                      
                      common.hideAllPopup();
                     isGamePaused=false;
                     isPopup2Generated=true;
                    counting=true;
                    }
                }]
  },() => {
    isGamePaused=true;
   		 sounds.popup.play();
counting=false;
  });
}


function checkFinalScore(){
   console.log('Score: ', score);
   console.log('Eco Point: ', ecoPoint);
   if(score>20 && ecoPoint>=2){
     successTwo();
   }
   if(score>20 && ecoPoint <2){
     successOne();
   }
   if(score<=20){
     failPopup();
   }
}

function failPopup(){
  common.addPopup({
                popupId: 'failPopup',
                title: translation.GAME_02_FAIL_03,
                content: null,
                imgURL: '/images/popup/5-2-3_fail.png',
                buttons: [
                  {
                    title: translation.GAME_02_RETRY,
                    onclick: (event) => {
                      
                     common.hideAllPopup();
                     restartGame();
                    }
                }]
  },() => {
    isGamePaused=true;
    sounds.popup.play();

  });
}

function weedFailPopup(){
  common.addPopup({
    popupId:'weedFailPopup',
    title:'옥수수 농사 실패! 잡초에게 영양분을 뺏겼어요',
    content: null,
    imgURL: '/images/popup/5-2-1_fail.png',
    buttons: [
      {
        title:'다시하기',
        onclick:(event) => {
          common.hideAllPopup();
          restartGame();
        }
      }]
  }, () => {
    isGamePaused=true;
    sounds.popup.play();
  });
}
function bugFailPopup(){
  common.addPopup({
    popupId:'bugFailPopup',
    title:'옥수수 농사 실패! 해충을 제 때 방제해주세요',
    content: null,
    imgURL: '/images/popup/5-2-2_fail.png',
    buttons: [
      {
        title:'다시하기',
        onclick:(event) => {
          common.hideAllPopup();
          restartGame();
        }
      }]
  }, () => {
    isGamePaused=true;
    sounds.popup.play();
  });
}
function successOne(){
  common.addPopup({
                popupId: 'SuccessOnePopup',
                title: translation.GAME_02_SUCCESS,
                content: null,
                imgURL: '/images/popup/5-2-3_success01.png',
                buttons: [
                  {
                    title: translation.GAME_02_HARVEST,
                    onclick: (event) => {
                      
                     common.hideAllPopup();
                     common.completeStage('02');
                    }
                }]
  },() => {
    isGamePaused=true;
    sounds.success.play();
  });
}

function successTwo(){
  common.addPopup({
                popupId: 'SuccessTwoPopup',
                title: translation.GAME_02_SUCCESS_ORGANIC,
                content: null,
                imgURL: '/images/popup/5-2-3_success02.png',
                buttons: [
                  {
                    title: translation.GAME_02_HARVEST,
                    onclick: (event) => {
                      
                     common.hideAllPopup();
                     common.completeStage('02');
                    }
                }]
  },() => {
    isGamePaused=true;
    sounds.success.play();
  });
}






