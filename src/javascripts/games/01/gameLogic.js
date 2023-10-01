import * as PIXI from 'pixi.js';

import {
  app, Sprite, Graphics, resources, resolution,
} from './init.js';
import { stageSentences } from './texts.js';
import { common } from '../../common.js';

let batContainer; let toolboxContainer; let items; let melon; let rake; let wateringCan; let seedPouch; let batSize; let cursorSprite; let guideBox; let guideText;
let wateringCanClicked = false;
let seedPouchClicked = false;
let rakeClicked = false;
let state; let id; let rocks; let healthBar; let outerBar; let redBar; let innerBar; let gameScene; let gameOverScene; let health; let MaxHealthValue; let numberOfCol; let numberOfRows; let scale;
let isGamePaused=false; let melonState='melon'; let niceFace; let faces; let notbadFace; let badFace; let currentStageAtStart; 
let gameStage = 0;
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

export function setup() {
 // console.log('All image files loaded');
  id = resources['/images/sprites/soils.json'].textures;
  items = resources['/images/sprites/items.json'].textures;
  rocks = resources['/images/sprites/rock-soils.json'].textures;
 faces=resources['/images/sprites/faces.json'].textures;
  
  gameScene = new PIXI.Container();
  app.stage.addChild(gameScene);
 
  createBat();
  CreateToolBox();
  CreateHealthBar();
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
  batPlain.y = ((app.view.height / resolution) - batPlain.height) / 2 + 25; // 처음 밭플레인, 올리려면 50 숫자 줄임.
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

function CreateToolBox() {
  const toolWidth = batSize;
  const toolHeight = batSize;

  // Create a new container for the toolbox
  toolboxContainer = new PIXI.Container();

  // Create and add rake to the container
  rake = new Sprite(items['rake_true2x.png']);
  rake.anchor.set(0.5);
  rake.width = toolWidth;
  rake.height = toolHeight;
  rake.x = toolWidth / 2; // Start from the half of the width
  rake.y = toolHeight / 2;
  rake.interactive = true;
  rake.on('pointerdown', () => {
    deactivateItem(rake);
    rakeClicked = true;
    console.log('rakeClicked');
  });
  toolboxContainer.addChild(rake);

  // Create and add wateringCan to the container
  wateringCan = new Sprite(items['water_true2x.png']);
  wateringCan.anchor.set(0.5);
  wateringCan.width = toolWidth;
  wateringCan.height = toolHeight;
  wateringCan.x = rake.x + toolWidth;
  wateringCan.y = toolHeight / 2;
  wateringCan.interactive = false;
  wateringCan.on('pointerdown', () => {
    deactivateItem(wateringCan);
    wateringCanClicked = true;
    console.log('wateringCanClicked');
  });
  toolboxContainer.addChild(wateringCan);

  // Create and add seedPouch to the container
  seedPouch = new Sprite(items['seeds_true2x.png']);
  seedPouch.anchor.set(0.5);
  seedPouch.width = toolWidth;
  seedPouch.height = toolHeight;
  seedPouch.x = wateringCan.x + toolWidth;
  seedPouch.y = toolHeight / 2;
  seedPouch.interactive = false;
  seedPouch.on('pointerdown', () => {
    deactivateItem(seedPouch);
    seedPouchClicked = true;
    console.log('seedPouchClicked');
  });
  toolboxContainer.addChild(seedPouch);

  // Create and add melon to the container
  melon = new Sprite(items['melon_true2x.png']);
  melon.anchor.set(0.5);
  melon.width = toolWidth;
  melon.height = toolHeight;
  melon.x = seedPouch.x + toolWidth;
  melon.y = toolHeight / 2;
  melon.interactive = true;
  melon.on('pointerdown', melonClick);
  toolboxContainer.addChild(melon);

  // Position the toolboxContainer
  toolboxContainer.x = ((app.view.width / resolution) - toolboxContainer.width) / 2;
  toolboxContainer.y = (app.view.height / resolution) - toolboxContainer.height - 12;

  gameScene.addChild(toolboxContainer);
}

function melonClick() {
  let popupSound=new Howl({
    src: ['/sound/S_popup.mp3'],
  });
  
  if(melonState==='rock'){
    health+=10;
    console.log('rock clicked, health incremented to: ', health);
    //return;// If you don’t want to show a popup when the rock is clicked, return here
  }
  
  health += 100;
  let popupTitle = '';
  let IMG = '';
  
  switch(melonState){
    case 'melon':
      popupTitle='시원하고 달콤한 수박화채가 활력을 채워줍니다';
      IMG:'/images/popup/4-2-1_energy.png';
      break;
    case 'noodle':
      popupTitle='매콤한 국수를 새참으로 먹으며 힘을 보충합니다';
      IMG:'/images/popup/4-2-2_energy.png';
      break;
    case 'coffee':
      popupTitle='차가운 아메리카노가 피로를 풀어줍니다';
      IMG:'/images/popup/4-2-3_energy.png';
      break;
    default:
    console.error(`Unexpected melonState: ${melonState}`);
    return;
  }
  
 common.addPopup({
   popupId: 'energyPopup',
   title: popupTitle,
   content: null,
   imgURL:IMG,
   buttons:[{
     title:"먹기",
     onclick:(event) => {
       deactivateItem(melon);
       common.hideAllPopup();
        //resume the game
       isGamePaused=false;
       console.log('먹기 button clicked');
     }
   }]
 }, () =>{
       // Code to execute when the popup is opened.
       isGamePaused=true;
      popupSound.play();
 });
}

function deactivateItem(item) {
 if(item != melon){
    if (item === rake) {
    item.texture = items['rake_false2x.png'];
  }
  if (item === wateringCan) {
    item.texture = items['water_false2x.png'];
  }
  if (item === seedPouch) {
    item.texture = items['seeds_false2x.png'];
  }
  return;
 }
 
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
    displayWarning('힘들면 쉬어도 괜찮아요.', 3000); // 5 seconds warning duration
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
    initializeGuideBox(['START']); // Pass ['START'] as a placeholder sentence
    guideText.text = 'START';
    // Make 'START' text interactive
    guideText.interactive = true;
    guideText.buttonMode = true;
    guideText.on('pointerdown', onStartTextClick); // Assign a click event handler to 'START' text
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

function onStartTextClick() {
  let startSound = new Howl({
    src: ['/sound/S_levelStart.mp3'],
  });
  startSound.play(); // Play sound after a user gesture (click)

  guideText.interactive = false;
  guideText.buttonMode = false;
  guideText.off('pointerdown', onStartTextClick); // Remove the click event after it's clicked
  
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

function initializeGuideBox(sentences){
  guideBox = new PIXI.Graphics();
  guideBox.beginFill(0xFFFFFF);
  guideBox.drawRoundedRect(0, 0, batContainer.width * 1.5, (app.view.height / resolution) / 8, 16);
  guideBox.endFill();
  guideBox.x = ((app.view.width / resolution) - guideBox.width) / 2;
  guideBox.y = (app.view.height / resolution) / 10;
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
    if (gameStage != currentStageAtStart) {
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

  if (gameStage === 1 && rakeClicked) {
    if (Math.random() <= 0.4) {
      const rockVariations = ['soils0-1.png', 'soils0-2.png', 'soils0-3.png'];
      const randomRock = rockVariations[Math.floor(Math.random() * rockVariations.length)];
      batSprite = new Sprite(rocks[randomRock]);
    } else {
      batSprite = new Sprite(id['soils02@3x.png']);
    }
    batSprite.interactive = true;
    batSprite.on('pointerdown', onClick);
    bat1Array.push(batSprite);
    wateringCan.interactive = false;
  } else if (gameStage === 2) {
    wateringCan.interactive = true;

    if (wateringCanClicked) {
      batSprite = new Sprite(id['soils03@3x.png']);
      batSprite.interactive = true;
      batSprite.on('pointerdown', onClick);

      const index = bat1Array.indexOf(this);
      if (index > -1) {
        bat1Array.splice(index, 1, batSprite);
      } else {
        bat1Array.push(batSprite);
      }
    }
  } else if (gameStage === 3 && seedPouchClicked) {
    batSprite = new Sprite(id['soils04-1@3x.png']);
    batSprite.interactive = true;
    batSprite.on('pointerdown', onClick);

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

  common.addPopup({
                popupId: 'failGamePopup',
                title: '에너지를 소진했습니다. 적절히 쉬는 것도 중요해요!',
                content: null,
                imgURL: '/images/popup/4-3_fail.png',
                buttons: [{
                    title: "다시하기",
                    onclick: (event) => {
                      
                      common.hideAllPopup();
                      restartGame();
                    }
                }]    
            }, () => {
		 isGamePaused=true;
});
}

function SuccessScene() {

   common.addPopup({
                popupId: 'successGamePopup',
                title: '성공! 마침내 쓸만한 땅을 만들어냈군요!',
                content: null,
                imgURL: '/images/popup/4-3_success.png',
                buttons: [{
                    title: "다음 단계로 이동",
                    onclick: (event) =>{
                     common.completeStage('01');
                      common.hideAllPopup();
                    } 
                }]    
            }, () => {
		// 팝업 열렸을때 실행시키고 싶은 함수
		 isGamePaused=true;
});
}



function restartGame() {
  gameStage = 1;
  wateringCan.visible = false;
  melon.interactive = true;
  isGamePaused = false; // Ensure game is not paused when restarted

  // Removing children from the containers
  batContainer.removeChildren();
  toolboxContainer.removeChildren();
  if (cursorSprite) cursorSprite.removeChildren();
  
  // Recreate elements and add them back to their parent containers
  createBat();
  CreateToolBox();
  CreateGuideConsole();
  createFaceStatus();
  startSentenceDisplayInterval();
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

  rakeClicked = false;
  // Possibly other variables that need to be reset
}


