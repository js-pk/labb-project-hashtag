import * as PIXI from 'pixi.js';

import { app, Sprite, Graphics,resources,resolution } from './01_init.js';
import {stageSentences} from './01_texts.js';
import {createTutorial,startTutorial} from './01_tutorial.js';

     let batContainer,toolboxContainer,items,stoneSprite,melon,rake,melonCounterText, wateringCan,seedPouch, batSize, cursorSprite,guideBox,guideText,successText;
     let wateringCanClicked = false;
     let seedPouchClicked=false;
     let rakeClicked=false;
      let state,id,rocks,healthBar,outerBar, redBar,innerBar, GameoverText, gameScene,gameOverScene,successScene,health, MaxHealthValue, numberOfCol,numberOfRows,scale;
      let gameStage=0;
      let bat1Array=[];
      let melonClicks=2;
      let currentMessage={
          type:"guide",
          index:0,
          interval:null
      }
    const baseWindowWidth = 750/2;
  
        scale = app.view.width / baseWindowWidth;
        numberOfCol = 4;  
        numberOfRows = 6; 

    const baseBatSize = 60; // Original rectangle size

    batSize = baseBatSize * scale;
  
export function setup(){
    console.log("All image files loaded");
    
    id = resources["/images/sprites/soils.json"].textures;
    items = resources["/images/sprites/tools.json"].textures;
    rocks=resources["/images/sprites/rock-soils.json"].textures;
 
    
    gameScene = new PIXI.Container();
    gameScene.visible=false;
    app.stage.addChild(gameScene);


    createBat();
    CreateGameOverScene();
    CreateToolBox();
CreateHealthBar();
CreateGuideConsole();
    createSuccessScene();
    
    createTutorial(app.stage);
    startTutorial(() => {
        gameScene.visible=true;
    });
    
    app.ticker.add(delta => gameLoop(delta));

    state=play;
}


function createBat(){
    
    let batPlain=new Sprite(id["soil_plain@3x.png"]);
    batPlain.width=batSize*numberOfCol;
    batPlain.height=batSize*numberOfRows;
    batPlain.x=((app.view.width/resolution)-batPlain.width)/2;
    batPlain.y=((app.view.height/resolution)-batPlain.height)/2+50; //처음 밭플레인, 올리려면 50 숫자 줄임.
    gameScene.addChild(batPlain);
    
     batContainer = new PIXI.Container();
    for(let i = 0; i < numberOfCol; i++) {
        for(let j = 0; j < numberOfRows; j++) {
            let batSpot = new PIXI.Graphics();
            
            batSpot.beginFill(0xFF0000,0.01);
            
            const x = batSize* i;
            const y = batSize*j;
            
            batSpot.drawRect(0,0,batSize,batSize);
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

   
   stoneSprite=new PIXI.Sprite(items["items_0000_Stone.png"]);
   stoneSprite.scale.set(scale);
   stoneSprite.visible=false;
   gameScene.addChild(stoneSprite);
  
}
function CreateToolBox() {
    //let spacing = 20; // Adjust as per your need
    let toolWidth = batSize;
    let toolHeight = batSize;
    
    // Create a new container for the toolbox
    toolboxContainer = new PIXI.Container();

    // Create and add rake to the container
    rake = new Sprite(items["tool_true2x.png"]);
    rake.anchor.set(0.5);
    rake.width = toolWidth;
    rake.height = toolHeight;
    rake.x = toolWidth / 2;  // Start from the half of the width
    rake.y = toolHeight / 2;
    rake.interactive = true;
    rake.on('pointerdown', function() {
        deactivateItem(rake);
        rakeClicked = true;
        console.log('rakeClicked');
    });
    toolboxContainer.addChild(rake);

    // Create and add wateringCan to the container
    wateringCan = new Sprite(items["water_true2x.png"]);
   wateringCan.anchor.set(0.5);
    wateringCan.width = toolWidth;
    wateringCan.height = toolHeight;
    wateringCan.x = rake.x  +toolWidth;
    wateringCan.y = toolHeight / 2;
    wateringCan.interactive = false;
    wateringCan.on('pointerdown', function() {
        deactivateItem(wateringCan);
        wateringCanClicked = true;
        console.log('wateringCanClicked');
    });
    toolboxContainer.addChild(wateringCan);

    // Create and add seedPouch to the container
    seedPouch = new Sprite(items["seeds_true2x.png"]);
    seedPouch.anchor.set(0.5);
    seedPouch.width = toolWidth;
    seedPouch.height = toolHeight;
    seedPouch.x = wateringCan.x  +toolWidth;
    seedPouch.y = toolHeight / 2;
    seedPouch.interactive = false;
    seedPouch.on('pointerdown', function() {
        deactivateItem(seedPouch);
        seedPouchClicked = true;
        console.log('seedPouchClicked');
    });
    toolboxContainer.addChild(seedPouch);

    // Create and add melon to the container
    melon = new Sprite(items["melon_true2x.png"]);
    melon.anchor.set(0.5);
    melon.width = toolWidth;
    melon.height = toolHeight;
    melon.x = seedPouch.x  + toolWidth;
    melon.y = toolHeight / 2;
    melon.interactive = true;
    melon.on('pointerdown', melonClick);
    toolboxContainer.addChild(melon);

    melonCounterText = new PIXI.Text(melonClicks, { fontFamily: 'Arial', fontSize: 12, fill: 'black' });
    melonCounterText.x = melon.x + 5;
    melonCounterText.y = melon.y - 5;
    toolboxContainer.addChild(melonCounterText);
    
    // Position the toolboxContainer
    toolboxContainer.x = ((app.view.width / resolution) - toolboxContainer.width) / 2;
    toolboxContainer.y = (app.view.height / resolution) - toolboxContainer.height - 30;
    
    gameScene.addChild(toolboxContainer);
}


function CreateGuideConsole(){

if(!stageSentences[gameStage]){
    console.error('no sentences found for stage ${currentStage}');
    return;
}
const sentences=stageSentences[gameStage];
 if(guideBox){
     gameScene.removeChild(guideBox);
     guideBox=null;
 }
guideBox=new PIXI.Graphics();
guideBox.beginFill(0xFFFFFF);
guideBox.drawRoundedRect(0,0,batContainer.width*1.3,(app.view.height/resolution)/8,40);
guideBox.endFill();
guideBox.x=((app.view.width/resolution)-guideBox.width)/2;
guideBox.y=(app.view.height/resolution)/10;
gameScene.addChild(guideBox);

const baseSize = 50; // This is your base font size for a known screen size, e.g., 800px width
const baseScreenWidth = 800; // The screen width you designed for
const currentScreenWidth = window.innerWidth; // Get current screen (viewport) width    
let dynamicFontSize= (currentScreenWidth/baseScreenWidth)*baseSize;
guideText=new PIXI.Text(sentences[0],{fontFamily:'Arial',fontSize:dynamicFontSize, fill:'#000000'});
guideText.anchor.set(0.5);
guideText.x=guideBox.width/2;
guideText.y=guideBox.height/2;
guideBox.addChild(guideText);
    
    const currentStageAtStart=gameStage;
 // Display each sentence sequentially every second
    let index = 1; // starting from the second sentence since the first one is already displayed
    let interval = setInterval(() => {
        if(gameStage != currentStageAtStart){// If the game stage has changed, stop the loop and exit
            clearInterval(interval);
            return;
        }
        guideText.text = sentences[index];
        index++;
       
       if (index >= sentences.length) {
        if(gameStage === 0) {
            clearInterval(interval);
            gameStage = 1;
            CreateGuideConsole();
        } else if (gameStage === 1 || gameStage === 2 || gameStage === 3) {
            index = 0;
        }
    }
}, 2000);
}

function displayWarning(message,duration){
    clearInterval(currentMessage.interval); //stop the regular guide message
    guideText.text=message;
    
setTimeout(() => {
        // After the warning duration, resume the guide messages
        currentMessage.type = "guide";
        guideText.text = stageSentences[gameStage][currentMessage.index];
        continueGuideMessages();
    },2000);
}

function continueGuideMessages(){
    currentMessage.interval = setInterval(() => {
        if (currentMessage.type !== "guide") {
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
function CreateHealthBar() {
    MaxHealthValue = app.view.height * 0.6;
    console.log(MaxHealthValue);
    health=MaxHealthValue;

    healthBar = new PIXI.Container();

    // Set the position to the left side and vertically centered
    healthBar.position.set((app.view.width/20), (app.view.height - MaxHealthValue) / 2);

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

function play(delta) {
    // Increase health over time
    health += 0.05 * delta;

    // Ensure health doesn't exceed maximum
    if (health > MaxHealthValue) {
        health = MaxHealthValue;
    }

    let healthPercentage = (health / MaxHealthValue) * 100;
    let isLandscape = app.view.width > app.view.height;

    if (isLandscape) {
        if (healthPercentage > 50) {
            outerBar.width = health;
            redBar.width = 0;  // Hide red bar when green bar is dominant
        } else {
            redBar.width = health;  
            outerBar.width = 0;  
        }

        // Horizontal positioning
        outerBar.x = MaxHealthValue - outerBar.width;
        redBar.x = outerBar.x - redBar.width;
    } else {
        if (healthPercentage > 50) {
            outerBar.height = health;
            redBar.height = 0;  // Hide red bar when green bar is dominant
        } else {
            redBar.height = health;  
            outerBar.height = 0;  
        }

        // Vertical positioning
        outerBar.y = MaxHealthValue- outerBar.height;
        redBar.y = outerBar.y - redBar.height;
    }

    if (health <= 0) {
        state = end;
    }
    
    if (health < 30) {
    currentMessage.type = "warning";
    displayWarning("벌써 지친건가요? 체력이 모두 떨어기 전에 잠시 쉬어주세요", 3000); // 5 seconds warning duration
}
}

function deactivateItem(item){
    if(item===rake){
       
        item.texture= items["tool_false2x.png"];
        item.width=batSize;
        item.height=batSize;
    }
    if(item===wateringCan){
        item.texture=items["water_false2x.png"];
        item.width=batSize;
        item.height=batSize;
    }
    if(item===seedPouch){
        item.texture=items["seeds_false2x.png"];
        item.width=batSize;
        item.height=batSize;
    }
}



function checkTransition(){
    let clickedCount = Array.from(batContainer.children).filter(sprite => sprite.isFilled).length;
    let soilCount = Array.from(batContainer.children).filter(sprite => sprite.texture === id["soils02@3x.png"]).length;
    let totalSpots = 4 * 6; // We know the exact number of spots from the loop

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

function onClick(){
  if (this.texture === rocks["soils0-1.png"] || this.texture === rocks["soils0-2.png"] || this.texture === rocks["soils0-3.png"]) {
        this.texture = id["soils02@3x.png"];
        checkTransition();
        health -=20;
        return; // Return early after handling rock click
    }
    
  if(this.isFilled){
   return; //if it's filled, just return and don't do anything
  }
  
 let batSprite;
 
    if (gameStage === 1&& rakeClicked) {
        if(Math.random() <=0.4){
            let rockVariations=["soils0-1.png","soils0-2.png","soils0-3.png"];
            let randomRock=rockVariations[Math.floor(Math.random()*rockVariations.length)];
            batSprite=new Sprite(rocks[randomRock]);
        }else{
            batSprite = new Sprite(id["soils02@3x.png"]);

        }
        batSprite.interactive = true;
        batSprite.on('pointerdown', onClick);
        bat1Array.push(batSprite);
        wateringCan.interactive=false;

    } else if (gameStage===2 ){
        wateringCan.interactive=true;
        
        if(wateringCanClicked){
             batSprite = new Sprite(id["soils03@3x.png"]);
        batSprite.interactive = true;
        batSprite.on('pointerdown', onClick);
        
        const index = bat1Array.indexOf(this);
        if (index > -1) {
            bat1Array.splice(index, 1, batSprite);
        } else {
            bat1Array.push(batSprite);
        }
       
    } 
        
    }else if(gameStage===3 && seedPouchClicked){
        batSprite = new Sprite(id["soils04-1@3x.png"]); 
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

     batSprite.width=batSize;
     batSprite.height=batSize;
        batSprite.x = this.x;
        batSprite.y = this.y;
        batSprite.isFilled = true;

        this.parent.addChild(batSprite);
        this.parent.removeChild(this); // Remove the original square
      
       checkTransition();
  health -=20;
}
}

function transitionToStage2(){
  gameStage =2;
  console.log("transitioned to stage 2");
  wateringCan.visible=true;
  wateringCan.interactive=true;
  //reset isFilled for all spots for stage 2
  Array.from(batContainer.children).forEach(sprite => {
   sprite.isFilled=false;
  });
}


function transitionToStage3(){
    gameStage=3;
    console.log("transitioned to stage 3");
    
    seedPouch.visible=true;
    seedPouch.interactive=true;
     //reset isFilled for all spots for stage 2
  Array.from(batContainer.children).forEach(sprite => {
   sprite.isFilled=false;
  });
}
function gameLoop(delta){
    //Runs the current game `state` in a loop and renders the sprites
  state(delta);
}   
  


function melonClick(){
 health +=100;
 melonClicks--;
     melonCounterText.text = melonClicks;

 if(melonClicks ==0){
  melon.visible=false;
  melon.interactive=false;
  melon.off('pointerdown',melonClick);
 }
}
function createSuccessScene(){
    
   const text = "해냈군요! \n\n당신이 클릭 한 번으로 밭을 갈고 \n\n옥수수를 심는다고 해서, \n\n그게 진짜 농사보다 덜 중요한 건 아니에요. \n\n디지털 세계에서도 '노동'이라는 것은 존재하거든요. ▶\n\n이것을 ‘놀이노동’이라고 해요.";

   successScene=new PIXI.Container();
   app.stage.addChild(successScene);
   let successText=new PIXI.Text(text, {fontFamily:"Arial", fontSize:20, fill:"white"});
   successText.x=app.view.width/2-successText.width/2;
   successText.y=app.view.height/2;
   successScene.addChild(successText);
   successScene.visible=false;
}
   
function showButtons(){
    
    let retryButton=new PIXI.Graphics();
    let nextButton=new PIXI.Graphics();
    retryButton.beginFill(0xFF3300);
    retryButton.drawRoundedRect(0,0,100,50,50,5);
    retryButton.endFill();
    
    // nextButton.beginFill(0x8A2BE2);
    // nextButton.drawRoundedRect(0,0,100,50,50,5);
    // nextButton.endFill();
    
    retryButton.interactive=true;
    retryButton.on('pointerdown',restartGame);
    
    nextButton.interactive=true;
 //   nextButton.on('pointerdown',completeStage('01'));
     // completeStage('01');
   let retryText=new PIXI.Text('다시 하기', {fontFamily:'Arial', fontSize:24, fill: 0xffffff});
   let nextText=new PIXI.Text('LV.2 게임으로 이동!', {fontFamily:'Arial', fontSize:24, fill:0xffffff} );
   retryText.position.set((retryButton.width-retryText.width)/2, (retryButton.height-retryText.height)/2);
   nextText.position.set((nextButton.width-nextText.width)/2,(nextButton.height-nextText.height)/2);
   retryButton.position.set(app.screen.width/2-retryButton.width/2,app.screen.height/2);
   nextButton.position.set(app.screen.width/2-nextButton.width/2,retryButton.y-50-retryButton.height);
   retryButton.addChild(retryText);
   nextButton.addChild(nextText);
   retryButton.visible=true;
   nextButton.visible=true;
   app.stage.addChild(retryButton);
 //  app.stage.addChild(nextButton);
}


function CreateGameOverScene(){
     //create gameover scene 
  gameOverScene=new PIXI.Container();
  app.stage.addChild(gameOverScene);
  gameOverScene.visible=false;
  GameoverText=new PIXI.Text('벌써 지친건가요? 체력이 모두 떨어기 전에 잠시 쉬어주세요',
  {fontFamily: "Arial", fontSize: 50, fill: "white"});
  GameoverText.x=app.view.width/2-GameoverText.width/2;
  GameoverText.y=app.view.height/2;
  gameOverScene.addChild(GameoverText);
}

function SuccessScene(){
    
    console.log("success");
    gameScene.visible=false;
    successScene.visible=true;
    // completeStage('01');
     setTimeout(()=>{
        showButtons();
        
   },3000);
}

function end(){
  gameScene.visible=false;
  gameOverScene.visible=true;
  GameoverText.visible=true;
  console.log("Game OVER!");
  app.ticker.stop();
  setTimeout(()=>{
      restartGame();
  },1000); //1 second delay
}


function restartGame() {
    gameStage = 1;
    wateringCan.visible=false;
    batContainer.removeChildren();
     toolboxContainer.removeChildren();
  
    app.stage.removeChildren();
    
    
    // Add gameScene and batContainer back to the stage if they aren't already
    if (!app.stage.children.includes(gameScene)) {
        app.stage.addChild(gameScene);
    }
    if (!gameScene.children.includes(batContainer)) {
        gameScene.addChild(batContainer);
    }
    if(cursorSprite){
        cursorSprite.removeChildren();

    }
   
    createBat();
    createSuccessScene();
    CreateToolBox();
    CreateGuideConsole();
    CreateGameOverScene();
    CreateHealthBar();

    gameScene.visible = true;
    gameOverScene.visible = false;

    melon.interactive = true;
    melonClicks=2; 
    melonCounterText.text = melonClicks;
    
    state = play;

    // Ensure gameLoop is removed from the ticker to prevent duplicate additions
    app.ticker.remove(gameLoop);
    app.ticker.add(gameLoop);

    app.ticker.start();
    health=MaxHealthValue;

    outerBar.height = health;
    outerBar.y = MaxHealthValue - health;
    rakeClicked=false;
}