//game LV1
/* global translation */
import * as PIXI from 'pixi.js';

import {
  app, Sprite, Graphics, resources, resolution,
} from './init.js';
const stageSentences = translation.GAME_01_SENTENCES;
import { common } from '../../common.js';

let batContainer; let toolboxContainer; let items; let melon; let rake; let wateringCan; let seedPouch; let batSize; let cursorSprite; let guideBox; let guideText;let startButton;
let clickAnimation; let state; let id; let rocks; let healthBar; let outerBar; let redBar; let innerBar; let gameScene; let health; let MaxHealthValue; let numberOfCol; let numberOfRows; let scale;
let isGamePaused=false; let melonState='melon'; let niceFace; let faces; let notbadFace; let badFace; let currentStageAtStart; let popupSound;let earthworm;
let gameStage = 0; let isMelonPopupGenerated=false; let isNoodlePopupGenerated=false; let isCoffeePopupGenerated=false; let isRockPopupGenerated=false;
const bat1Array = [];

const currentMessage = {
  type: 'guide',
  index: 0,
  interval: null,
};
const baseWindowWidth = 750 / 2;

scale = app.view.width / baseWindowWidth;
numberOfCol = 4;
numberOfRows = 6;

const baseBatSize = 60; // Original rectangle size

batSize = baseBatSize * scale / resolution;

const sounds={
  seed:new Howl({
    src:['/sound/S_seed.mp3']}),
  
watering:new Howl({
  src:['/sound/S_water.mp3']
}),  
rake:new Howl({
  src:['/sound/S_tool.mp3']
}),
success:new Howl({
  src:['/sound/S_success.mp3']
}), 
fail:new Howl({
  src:['/sound/S_fail.mp3']
})
}

export function setup() {
 // console.log('All image files loaded');
  id = resources['/images/sprites/soils.json'].textures;
  items = resources['/images/sprites/items.json'].textures;
  rocks = resources['/images/sprites/rock-soils.json'].textures;
 faces=resources['/images/sprites/faces.json'].textures;
  popupSound=new Howl({
    src: ['/sound/S_popup.mp3'],
  });
  
  gameScene = new PIXI.Container();
  app.stage.addChild(gameScene);
  
  createStartButton();
  gameScene.alpha=0.3;
  
  CreateToolBox();
  toolboxContainer.visible=false;
  CreateHealthBar();
  createBat();
  CreateGuideConsole();
  createFaceStatus();
   
  app.ticker.add((delta) => gameLoop(delta));

  state = play;
}

function createBat() {
  const batPlain = new Sprite(id['soil_plain01@3x.png']);
  batPlain.width = batSize * numberOfCol;
  batPlain.height = batSize * numberOfRows;
  batPlain.x = ((app.view.width / resolution) - batPlain.width) / 2;
  batPlain.y = ((app.view.height / resolution) - batPlain.height) / 2 + 45; // 처음 밭플레인, 올리려면 숫자 줄임.
 //batPlain.y= guideBox.y+50;
  gameScene.addChild(batPlain);

  batContainer = new PIXI.Container();
  for (let i = 0; i < numberOfCol; i++) {
    for (let j = 0; j < numberOfRows; j++) {
      const batSpot = new PIXI.Graphics();

      batSpot.beginFill(0xFF0000, 0.01);

      const x = batSize * i;
      const y = batSize * j;

      batSpot.drawRect(0, 0, batSize, batSize);
      batSpot.endFill();

      batSpot.isFilled = false;

      batSpot.x = x;
      batSpot.y = y;
      batSpot.interactive = true;
      batSpot.cursor = 'pointer';
      batSpot.on('pointerdown', onClick);
      batContainer.addChild(batSpot);
    }
  }

  batContainer.x = batPlain.x;
  batContainer.y = batPlain.y;
  gameScene.addChild(batContainer);
}

function getClickFrames(){
  const clickTextureAtlas = resources['/images/sprites/click-tab.json'].textures;
  const frames = Object.keys(clickTextureAtlas).map(frameKey => clickTextureAtlas[frameKey]);
  return frames;
}

function CreateToolBox() {
 
  const toolWidth = batSize;
  const toolHeight = batSize;

  toolboxContainer = new PIXI.Container();

  rake = new Sprite(items['rake_true2x.png']);
  rake.anchor.set(0.5);
  rake.width = toolWidth;
  rake.height = toolHeight;
  rake.x = toolWidth / 2; // Start from the half of the width
  rake.y = toolHeight / 2;
  rake.interactive = true;
  toolboxContainer.addChild(rake);

  wateringCan = new Sprite(items['water_false2x.png']);
  wateringCan.anchor.set(0.5);
  wateringCan.width = toolWidth;
  wateringCan.height = toolHeight;
  wateringCan.x = rake.x + toolWidth;
  wateringCan.y = toolHeight / 2;
  wateringCan.interactive = false;
  toolboxContainer.addChild(wateringCan);

  seedPouch = new Sprite(items['seeds_false2x.png']);
  seedPouch.anchor.set(0.5);
  seedPouch.width = toolWidth;
  seedPouch.height = toolHeight;
  seedPouch.x = wateringCan.x + toolWidth;
  seedPouch.y = toolHeight / 2;
  seedPouch.interactive = false;
  toolboxContainer.addChild(seedPouch);

  melon = new Sprite(items['melon_true2x.png']);
  melon.anchor.set(0.5);
  melon.width = toolWidth;
  melon.height = toolHeight;
  melon.x = seedPouch.x + toolWidth;
  melon.y = toolHeight / 2;
  melon.interactive = true;
  melon.on('pointerdown', melonClick);
  toolboxContainer.addChild(melon);

  toolboxContainer.x = ((app.view.width / resolution) - toolboxContainer.width) / 2;
  toolboxContainer.y = (app.view.height / resolution) - toolboxContainer.height - 12;

  gameScene.addChild(toolboxContainer);
}

function melonClick() {
   health += 30;
  changeItem(melon);
}

function changeItem(item) {
 if(item !== melon){
    if (item === rake) {
      item.texture = items['rake_false2x.png'];
    }
    if (item === wateringCan) {
      // Check if wateringCan texture is 'water_true2x.png'
      // and change it to 'water_false2x.png' if it is
      if(item.texture === items['water_true2x.png']) {
        item.texture = items['water_false2x.png'];
      } else {
        item.texture = items['water_true2x.png'];
      }
    }
    if (item === seedPouch) {
      item.texture = items['seeds_true2x.png'];
    }
    return;
  }
 
 
 let previousState= melonState;
 
 switch(melonState){
   case 'melon':
     item.texture=items['noodles_true2x.png'];
     melonState='noodle';
     break;
   case 'noodle':
     item.texture=items['coffee_true2x.png'];
     melonState='coffee';
     break;
  case 'coffee':
    item.texture=items['rock_true2x.png'];
    melonState='rock';
    break;
 }
  item.width=batSize;
  item.height=batSize;
  
  switch(previousState){
    case 'melon':
          melonToNoodlePopup();
         // isMelonPopupGenerated=true;
      break;
    case 'noodle':
        noodleToCoffeePopup();
      //  isNoodlePopupGenerated=true;
      break;
    case 'coffee':
          coffeeToRockPopup();
       // isCoffeePopupGenerated=true;
      break;
    case 'rock':
      health+=2;
      console.log('rock clicked, health incremented to: ', health);
        restwithantPopup();
     //   isRockPopupGenerated=false;
    break;
  }
}

function melonToNoodlePopup(){
  if (document.getElementById('melonToNoodlePopup')) {
    common.showPopup('melonToNoodlePopup');
  } else {
    common.addPopup({
      popupId: 'melonToNoodlePopup',
      title: translation.GAME_01_POPUP_WATERMELON,
      content: null,
      imgURL:'/images/popup/4-2-1_energy.png',
      buttons: [{
        title: translation.GAME_01_EAT,
        onclick: (event) => {
          common.hideAllPopup();
          isGamePaused=false;
          isMelonPopupGenerated=false;
        }
      }]
    }, ()=> {
      isGamePaused=true;
      popupSound.play();
     
    });
  }
}


function noodleToCoffeePopup(){
  if (document.getElementById('noodleToCoffeePopup')) {
    common.showPopup('noodleToCoffeePopup');
  } else {
    common.addPopup({
      popupId: 'noodleToCoffeePopup',
      title: translation.GAME_01_POPUP_NOODLE,
      content: null,
      imgURL:'/images/popup/4-2-2_energy.png',
      buttons: [{
        title: translation.GAME_01_EAT,
        onclick: (event) => {
          common.hideAllPopup();
          isGamePaused=false;
          isNoodlePopupGenerated=false;
        }
      }]
    }, ()=> {
      isGamePaused=true;
      popupSound.play();
      isNoodlePopupGenerated=true;
    });
  }
}

function coffeeToRockPopup(){
  if (document.getElementById('coffeeToRockPopup')) {
    common.showPopup('coffeeToRockPopup');
  } else {
    common.addPopup({
      popupId: 'coffeeToRockPopup',
      title: translation.GAME_01_POPUP_AMERICANO,
      content: null,
      imgURL:'/images/popup/4-2-3_energy.png',
      buttons: [{
        title: translation.GAME_01_EAT,
        onclick: (event) => {
          common.hideAllPopup();
          isGamePaused=false;
          isCoffeePopupGenerated=false;
        }
      }]
    }, ()=> {
      isGamePaused=true;
      popupSound.play();
      isCoffeePopupGenerated=true;
    });
  }
}

function restwithantPopup(){
  if (document.getElementById('restwithantPopup')) {
    common.showPopup('restwithantPopup');
  } else {
    common.addPopup({
      popupId: 'restwithantPopup',
      title: translation.GAME_01_POPUP_REST,
      content: null,
      imgURL:'/images/popup/restwithant_popup.png',
      buttons: [{
        title: translation.GAME_01_REST,
        onclick: (event) => {
          common.hideAllPopup();
          isGamePaused=false;
          isRockPopupGenerated=false;
        }
      }]
    }, ()=> {
      isGamePaused=true;
        popupSound.play();
      isRockPopupGenerated=true;
  
    });
  }
}
function CreateHealthBar() {
  MaxHealthValue = app.view.height * 0.5 / resolution;
  health = MaxHealthValue;
  healthBar = new PIXI.Container();

  // Set the position to the left side and vertically centered
  healthBar.position.set((app.view.width / resolution / 12), (app.view.height / resolution / 2)-100);

  gameScene.addChild(healthBar);

  innerBar = new Graphics();
  innerBar.beginFill(0x000000);
  innerBar.drawRoundedRect(0, 0, 7 * scale, MaxHealthValue, 20);
  innerBar.endFill();
  healthBar.addChild(innerBar);

  outerBar = new Graphics();
  outerBar.beginFill(0x00FF00);
  outerBar.drawRoundedRect(0, 0, 7 * scale, MaxHealthValue, 20);
  outerBar.endFill();
  healthBar.addChild(outerBar);

  redBar = new Graphics();
  redBar.beginFill(0xFF3300);
  redBar.drawRoundedRect(0, 0, 7 * scale, MaxHealthValue, 20);
  redBar.endFill();
  healthBar.addChild(redBar);
}
function gameLoop(delta) {
  // Runs the current game `state` in a loop and renders the sprites
  state(delta);
}
function play(delta) {
  if(isGamePaused) return; // Stops the execution of play function when the game is paused
  
  // Increase health over time
  health += 0.05 * delta;

  // Ensure health doesn't exceed maximum
  if (health > MaxHealthValue) {
    health = MaxHealthValue;
  }

  const healthPercentage = (health / MaxHealthValue) * 100;
 
    if (healthPercentage > 50) {
      outerBar.height = health;
      redBar.height = 0; // Hide red bar when green bar is dominant
    } else {
      redBar.height = health;
      outerBar.height = 0;
    }

    // Vertical positioning
    outerBar.y = MaxHealthValue - outerBar.height;
    redBar.y = outerBar.y - redBar.height;
  

  if (health <= 0) {
    state = end;
    end();
  }

  if (health < 30) {
    currentMessage.type = 'warning';
    displayWarning(translation.GAME_01_WARNING_01, 3000); // 5 seconds warning duration
  }
  // determine which face to show
  if (healthPercentage > 66) {
    niceFace.visible = true;
    notbadFace.visible = false;
    badFace.visible = false;
  } else if (healthPercentage > 33) {
    niceFace.visible = false;
    notbadFace.visible = true;
    badFace.visible = false;
  } else {
    niceFace.visible = false;
    notbadFace.visible = false;
    badFace.visible = true;
  }
  if(gameStage >=1 && Math.random()<0.001)spawnWorms();
}


function createFaceStatus(){
  
  niceFace = new Sprite(faces['1niceface.png']);
   notbadFace= new Sprite(faces['2notbadface.png']);
   badFace=new Sprite(faces['3badface.png']);
   // set position for each face above the health bar
   const faceYPos = healthBar.y - niceFace.height - 10; // 10 is the padding between face and health bar
   
   niceFace.position.set(healthBar.x-(niceFace.width/3), faceYPos);
   notbadFace.position.set(healthBar.x-(notbadFace.width/3), faceYPos);
   badFace.position.set(healthBar.x-(badFace.width/3), faceYPos);
   
   // Initially set visibility to false
   niceFace.visible = false;
   notbadFace.visible = false;
   badFace.visible = false;
   
   // Add to the game scene
   gameScene.addChild(niceFace);
   gameScene.addChild(notbadFace);
   gameScene.addChild(badFace);
}


function CreateGuideConsole() {
  if (gameStage === 0) {
    initializeGuideBox(['']); // Pass ['START'] as a placeholder sentence
    guideText.text = stageSentences[1][1];
    // Make 'START' text interactive
    // guideText.interactive = true;
    // guideText.buttonMode = true;
    // guideText.on('pointerdown', onStartTextClick); // Assign a click event handler to 'START' text
    return;
  }
  
  if (!stageSentences[gameStage]) {
    console.error(`No sentences found for stage ${gameStage}`);
    return;
  }

  const sentences = stageSentences[gameStage];
  initializeGuideBox(sentences); // Pass sentences for the current game stage
  guideText.text = sentences[0];
  startSentenceDisplayInterval(sentences);
}
function createStartButton(){
  // Create a button using PIXI Graphics
startButton = new PIXI.Graphics();
startButton.beginFill(0x0330fc); // #0330fc
startButton.drawRoundedRect(0, 0, 150, 50,20); // Draw the rectangle
startButton.endFill();

// Add text to the button
let buttonText = new PIXI.Text('START', {fontFamily : 'Neo둥근모', fontSize: 28, fill : 0xFFFFFF, align : 'center'});
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
clickAnimation.animationSpeed=0.2;
clickAnimation.loop=true;
app.stage.addChild(clickAnimation);
clickAnimation.play();
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
  toolboxContainer.visible=true;
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
  
  setTimeout(() =>{
    clickAnimation.x=(app.view.width/resolution)/2-100;
    clickAnimation.y=(app.view.height/resolution)/2;
    clickAnimation.visible=true;
    clickAnimation.play();
    
    setTimeout(() =>{
      clickAnimation.visible=false;
      clickAnimation.stop();
    },2000);
  },1000);
}

function initializeGuideBox(sentences){
  guideBox = new PIXI.Graphics();
  guideBox.beginFill(0xFFFFFF);
  guideBox.drawRoundedRect(0, 0, batContainer.width * 1.5, (app.view.height / resolution) / 8, 16);
  guideBox.endFill();
  guideBox.x = ((app.view.width / resolution) - guideBox.width) / 2;
  guideBox.y = (app.view.height / resolution) / 11;
  gameScene.addChild(guideBox);

  const baseSize = 40; // This is your base font size for a known screen size, e.g., 800px width
  const baseScreenWidth = 800; // The screen width you designed for
  const currentScreenWidth = window.innerWidth; // Get current screen (viewport) width
  const dynamicFontSize = (currentScreenWidth / baseScreenWidth) * baseSize;
  //  const dynamicFontSize = (window.innerWidth / 800) * 40; // Example calculation

  guideText = new PIXI.Text(sentences[0], { fontFamily: "Neo둥근모", fontSize: dynamicFontSize, fill: '#000000', wordWrap: true, wordWrapWidth: batContainer.width * 1.3 });
  guideText.anchor.set(0.5);
  guideText.x = guideBox.width / 2;
  guideText.y = guideBox.height / 2;
  guideBox.addChild(guideText);
}


function startSentenceDisplayInterval(sentences) {
  let index = 0;
  
  const interval = setInterval(() => {
    if (gameStage !== 1) {
      clearInterval(interval);
      return;
    }
    guideText.text = sentences[index];
    index++;
    if (index >= sentences.length) {
      if (gameStage === 1 || gameStage === 2 || gameStage === 3) {
        index = 0; // Restart loop for stages 1-3
      }
    }
  }, 2000);
}

function displayWarning(message, duration) {
  if (!currentMessage || !guideText || !stageSentences[gameStage]) {
    console.error("Undefined variables in displayWarning function.");
    return;
  }
  clearInterval(currentMessage.interval); // stop the regular guide message
  guideText.text = message;

  setTimeout(() => {
    // After the warning duration, resume the guide messages
    currentMessage.type = 'guide';
    guideText.text = stageSentences[gameStage][currentMessage.index];
    continueGuideMessages();
  }, 2000);
}

function continueGuideMessages() {
  if (!currentMessage || !guideText || !stageSentences[gameStage]) {
    console.error("Undefined variables in continueGuideMessages function.");
    return;
  }
  currentMessage.interval = setInterval(() => {
    if (currentMessage.type !== 'guide') {
      // if the message type has changed to warning, stop updating guide messages
      clearInterval(currentMessage.interval);
      return;
    }

    currentMessage.index++;
    if (currentMessage.index >= stageSentences[gameStage].length) {
      // Handle end of guide messages for the stage (similar to your previous code)
    } else {
      guideText.text = stageSentences[gameStage][currentMessage.index];
    }
  }, 2500);
}

function checkTransition() {
  const clickedCount = Array.from(batContainer.children).filter((sprite) => sprite.isFilled).length;
  const soilCount = Array.from(batContainer.children).filter((sprite) => sprite.texture === id['soils02@3x.png']).length;
  const totalSpots = 4 * 6; // We know the exact number of spots from the loop

  if (gameStage === 1 && soilCount === totalSpots) {
    transitionToStage2();
    CreateGuideConsole();
  } else if (gameStage === 2 && clickedCount === totalSpots) {
    transitionToStage3();
    CreateGuideConsole();
  } else if (gameStage === 3 && clickedCount === totalSpots) {
    SuccessScene();
  }
}
function transitionToStage2() {
  gameStage = 2;
  console.log('transitioned to stage 2');
  wateringCan.visible = true;
  wateringCan.interactive = true;
  changeItem(wateringCan);
  changeItem(rake);
  // reset isFilled for all spots for stage 2
  Array.from(batContainer.children).forEach((sprite) => {
    sprite.isFilled = false;
  });
}

function transitionToStage3() {
  gameStage = 3;
  console.log('transitioned to stage 3');

  seedPouch.visible = true;
  seedPouch.interactive = true;
  changeItem(seedPouch);
  changeItem(wateringCan);
  // reset isFilled for all spots for stage 2
  Array.from(batContainer.children).forEach((sprite) => {
    sprite.isFilled = false;
  });
}

function onClick() {
  if (this.texture === rocks['soils0-1.png'] || this.texture === rocks['soils0-2.png'] || this.texture === rocks['soils0-3.png']) {
    this.texture = id['soils02@3x.png'];
    checkTransition();
    health -= 20;
    return; // Return early after handling rock click
  }

  if (this.isFilled) {
    return; // if it's filled, just return and don't do anything
  }

  let batSprite;
  
  if (gameStage === 1) {
    if (Math.random() <= 0.4) {
      const rockVariations = ['soils0-1.png', 'soils0-2.png', 'soils0-3.png'];
      const randomRock = rockVariations[Math.floor(Math.random() * rockVariations.length)];
      batSprite = new Sprite(rocks[randomRock]);
      sounds.rake.play();
    } else {
      batSprite = new Sprite(id['soils02@3x.png']);
      sounds.rake.play();
    }
    batSprite.interactive = true;
    batSprite.on('pointerdown', function(){
      if(gameStage===1) sounds.rake.play();
      onClick.call(batSprite);
    });
    bat1Array.push(batSprite);
    wateringCan.interactive = false;
  } else if (gameStage === 2) {
      batSprite = new Sprite(id['soils03@3x.png']);
      sounds.watering.play();
      batSprite.interactive = true;
      batSprite.on('pointerdown', function(){
        sounds.watering.play();
        onClick.call(batSprite);
      });
      
      const index = bat1Array.indexOf(this);
      if (index > -1) {
        bat1Array.splice(index, 1, batSprite);
      } else {
        bat1Array.push(batSprite);
      }
    
  } else if (gameStage === 3) {
    batSprite = new Sprite(id['soils04-1@3x.png']);
    sounds.seed.play();
    batSprite.interactive = true;
    batSprite.on('pointerdown',function(){
      sounds.seed.play();
      onClick.call(batSprite);
    });

    const index = bat1Array.indexOf(this);
    if (index > -1) {
      bat1Array.splice(index, 1, batSprite);
    } else {
      bat1Array.push(batSprite);
    }
  }

  if (batSprite) {
    batSprite.width = batSize;
    batSprite.height = batSize;
    batSprite.x = this.x;
    batSprite.y = this.y;
    batSprite.isFilled = true;

    this.parent.addChild(batSprite);
    this.parent.removeChild(this); // Remove the original square

    checkTransition();
    health -= 20;
  }
}


function end() {
  if (document.getElementById('failGamePopup')) {
    common.showPopup('failGamePopup');
  } else {
    common.addPopup({
      popupId: 'failGamePopup',
      title: translation.GAME_01_WARNING_02,
      content: null,
      imgURL: '/images/popup/level1_fail.png',
      buttons: [{
          title: translation.GAME_01_RETRY,
          onclick: (event) => {
            
            common.hideAllPopup();
            restartGame();
          }
      }]    
    }, () => {
    	isGamePaused=true;
      sounds.fail.play();
    });
  }
}

function SuccessScene() {
  if (document.getElementById('successGamePopup')) {
    common.showPopup('successGamePopup');
  } else {
    common.addPopup({
      popupId: 'successGamePopup',
      title: translation.GAME_01_POPUP_SUCCESS,
      content: null,
      imgURL: '/images/popup/4-3_success.png',
      buttons: [{
          title: translation.GAME_01_POPUP_MOVE,
          onclick: (event) =>{
           common.completeStage('01');
            common.hideAllPopup();
          } 
      }]    
    }, () => {
  		// 팝업 열렸을때 실행시키고 싶은 함수
  		 isGamePaused=true;
  		 sounds.success.play();
    });
  }
}


function restartGame() {
  console.log('restartGame');
  isGamePaused=true;
  gameStage = 0;
  //app.stage.removeChildren();

  // Removing children from the containers
  batContainer.removeChildren();
  toolboxContainer.removeChildren();
  if (cursorSprite) cursorSprite.removeChildren();
  
  app.stage.addChild(gameScene);
  
  // Recreate elements and add them back to their parent containers
  createBat();
  CreateToolBox();
  melonState='melon';
 
  CreateGuideConsole();
  createFaceStatus();
  startSentenceDisplayInterval();
  
  createStartButton();
  gameScene.alpha=0.3;
 
  // Reset health and the health bar graphics to their initial state
  health = MaxHealthValue;
  outerBar.height = health;
  outerBar.y = MaxHealthValue - health;
  redBar.height = 0; // As the health is full, the redBar height should be 0
  
  // Ensure that gameScene and batContainer are added back to the stage
  if (!app.stage.children.includes(gameScene)) app.stage.addChild(gameScene);
  if (!gameScene.children.includes(batContainer)) gameScene.addChild(batContainer);
  
  // Reset the game state to play and restart the ticker if it was stopped
  state = play;
  if (!app.ticker.started) app.ticker.start();
    isGamePaused = false; // Ensure game is not paused when restarted

}


function getWormFrames(){
  const earthworm=resources['/images/sprites/earthworm.json'].textures;
 const frames = Object.keys(earthworm).map(frameKey => earthworm[frameKey]);
  return frames;
}
function spawnWorms(){
  const randomColumn = Math.floor(Math.random() * 4);
  const randomRow = Math.floor(Math.random() * 6);
  
  const wormFrames=getWormFrames();
  const worm=new PIXI.AnimatedSprite(wormFrames);
  
  worm.x=batSize *randomColumn;
  worm.y=batSize *randomRow;
  
  worm.timer=0;
  worm.column=randomColumn;
  worm.row=randomRow;
  worm.animationSpeed=0.1;
  worm.play();
  worm.visible=true;
  worm.lifetime=10;
  batContainer.addChild(worm);
}