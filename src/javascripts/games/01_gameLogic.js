import * as PIXI from 'pixi.js';

import { app, Container, Sprite, Graphics,resources } from './01_init.js';
import {stageSentences} from './01_texts.js';

     let batContainer,toolboxContainer,items,stoneSprite,melon,rake,melonCounterText, wateringCan,seedPouch, batSize,spacing, cursorSprite,guideBox,guideText,successText;
     let wateringCanClicked = false;
     let seedPouchClicked=false;
     let rakeClicked=false;
      let state,id,rocks,healthBar,outerBar, redBar, GameoverText,toolbox1,toolbox2,toolbox3,toolbox4, gameScene,gameOverScene,successScene;
      let gameStage=0;
      let health=328;
      let bat1Array=[];
      let melonClicks=2;
      let currentMessage={
          type:"guide",
          index:0,
          interval:null
      }
      let numberOfCol;
    let numberOfRows;
    // Assuming your 750px wide window fits 4 columns with 60 spacing in portrait
    const baseWindowWidth = 750 / 2;
  
    let scale;

    if (app.view.width > app.view.height) { // Check if it's in landscape orientation
        // In landscape, adjust scale based on height
        scale = app.view.height / baseWindowWidth;
        numberOfCol = 6;  // Set columns to 6 in landscape
        numberOfRows = 4; // Set rows to 4 in landscape
    } else {
        scale = app.view.width / baseWindowWidth;
        numberOfCol = 4;  // Set columns to 4 in portrait
        numberOfRows = 6; // Set rows to 6 in portrait
    }

 //   const baseSpacing = 55;
    const baseBatSize = 54; // Original rectangle size

    // Adjust spacing and rectangle size based on the window size
   // spacing = baseSpacing * scale;
    batSize = baseBatSize * scale;
  
    
export function setup(){
    console.log("All image files loaded");
    
    id = resources["/images/sprites/soils.json"].textures;
    items = resources["/images/sprites/tools.json"].textures;
    rocks=resources["/images/sprites/rock-soils.json"].textures;

    gameScene = new Container();
    app.stage.addChild(gameScene);

    createBat();
    CreateGameOverScene();
    CreateToolBox();
    CreatehealthBar();
    CreateGuideConsole();
    createSuccessScene();
    
    app.ticker.add(delta => gameLoop(delta));

    state=play;
}

function createBat(){
     batContainer = new Container();

    for(let i = 0; i < numberOfCol; i++) {
        for(let j = 0; j < numberOfRows; j++) {
            let batSpot = new Sprite(id["soils02@3x.png"]);
          //  batSpot.beginFill(0xFFFFFF, 0.4);
           // batSpot.drawRect(0, 0, batSize, batSize);
          //  batSpot.endFill();
            batSpot.isFilled = false;
            batSpot.width=batSize;
            batSpot.height=batSize;
            const x = batSize * i;
            const y = batSize * j;
            batSpot.x = x;
            batSpot.y = y;
            batSpot.interactive = true;
            batSpot.cursor = 'pointer';
            batSpot.on('pointerdown', onClick);
            batContainer.addChild(batSpot);
        }
    }

    batContainer.x = (app.view.width - batContainer.width) / 2;
    batContainer.y = (app.view.height - batContainer.height) / 2;


   stoneSprite=new PIXI.Sprite(items["items_0000_Stone.png"]);
   stoneSprite.scale.set(scale);
   stoneSprite.visible=false;
   gameScene.addChild(stoneSprite);
    gameScene.addChild(batContainer);
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
guideBox.beginFill(0xFFFFFF, 0.4);
guideBox.drawRect(0,0,batContainer.width*1.5,app.view.height/10);
guideBox.endFill();
guideBox.x=(app.view.width-guideBox.width)/2;
guideBox.y=app.view.height/20;
gameScene.addChild(guideBox);

const baseSize = 24; // This is your base font size for a known screen size, e.g., 800px width
const baseScreenWidth = 800; // The screen width you designed for
const currentScreenWidth = window.innerWidth; // Get current screen (viewport) width    
let dynamicFontSize= (currentScreenWidth/baseScreenWidth)*baseSize;
guideText=new PIXI.Text(sentences[0],{fontFamily:'Arial',fontSize:dynamicFontSize, fill:'#C133FF'});
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


function CreateToolBox() {
    let isLandscape = app.view.width > app.view.height;
    
    // Initialize positions to zero; these will be relative to the toolboxContainer
    let relativeX = 0;
    let relativeY = 0;

    toolboxContainer = new PIXI.Container();
    
    function createToolbox() {
        let toolbox = new PIXI.Graphics();
        toolbox.beginFill(0xFFFFFF, 0.3);
        toolbox.drawRect(0, 0, batSize, batSize);
        toolbox.endFill();
        toolbox.x = relativeX;
        toolbox.y = relativeY;
        toolboxContainer.addChild(toolbox);

        if (isLandscape) {
            relativeY += spacing;
        } else {
            relativeX += spacing;
        }

        return toolbox;
    }

    // Create the toolboxes
    toolbox1 = createToolbox();
    toolbox2 = createToolbox();
    toolbox3 = createToolbox();
    toolbox4 = createToolbox();
    
    gameScene.addChild(toolboxContainer);
    
    // Now, adjust the toolboxContainer's position based on app's view
    if (isLandscape) {
        toolboxContainer.x = 50;  // A little padding from the left side
        toolboxContainer.y = (app.view.height - toolboxContainer.height) / 2;

    } else {
        toolboxContainer.x = (app.view.width - toolboxContainer.width) / 2;
        toolboxContainer.y = app.view.height - toolboxContainer.height - 70;
    }
    rake=new Sprite(items["itemsR_0003_Rake.png"]);
    rake.width=batSize;
    rake.height=batSize;
    rake.x=toolbox1.x;
    rake.y=toolbox1.y;
    rake.interactive=true;
    rake.on('pointerdown',function(){
        setSpriteAsCursor(rake);
        rakeClicked=true;
    })
    toolboxContainer.addChild(rake);
    
    wateringCan=new Sprite(items["items_0001_Watering.png"]);
    wateringCan.width=batSize;
    wateringCan.height=batSize;
    wateringCan.x=toolbox2.x;
    wateringCan.y=toolbox2.y;
    wateringCan.visible=false;
    wateringCan.interactive=false;
    wateringCan.on('pointerdown',function(){
        setSpriteAsCursor(wateringCan);
        wateringCanClicked=true;
    });
    toolboxContainer.addChild(wateringCan);
    
    seedPouch=new Sprite(items["items_0002_Seed.png"]);
    seedPouch.width=batSize;
    seedPouch.height=batSize;
    seedPouch.x=toolbox3.x;
    seedPouch.y=toolbox3.y;
    seedPouch.visible=false;
    seedPouch.interactive=false;
    seedPouch.on('pointerdown',function(){
    setSpriteAsCursor(seedPouch);
    seedPouchClicked=true;
    })
    toolboxContainer.addChild(seedPouch);
    
    melon = new Sprite(items["items_0004_Melon.png"]);
    melon.width=batSize;
    melon.height=batSize;
    melon.x = toolbox4.x ;
    melon.y = toolbox4.y;
    melon.interactive = true;
    melon.on('pointerdown', melonClick);
    toolboxContainer.addChild(melon);

    melonCounterText = new PIXI.Text(melonClicks, { fontFamily: 'Arial', fontSize: 12, fill: 'black' });
    melonCounterText.x = melon.x + 5;
    melonCounterText.y = melon.y - 5;
    toolboxContainer.addChild(melonCounterText);
}
function setSpriteAsCursor(originalSprite){
    originalSprite.visible=false;
    if(cursorSprite){
        cursorSprite.destroy();
    }
    cursorSprite=new PIXI.Sprite(originalSprite.texture);
    cursorSprite.anchor.set(0.5);
    cursorSprite.scale.set(0.5);
    gameScene.addChild(cursorSprite);
    //app.view.style.cursor="none";
    app.view.addEventListener('mousemove',moveCursorSprite);
    app.view.addEventListener('touchmove',moveCursorSprite);
}
function moveCursorSprite(event){
  const pointer = event.touches ? event.touches[0] : event;
    const bounds = app.view.getBoundingClientRect(); // Get the canvas position and dimensions

    // Adjust cursorSprite's position by considering the canvas offsets
    cursorSprite.x = pointer.clientX - bounds.left;
    cursorSprite.y = pointer.clientY - bounds.top;
}


function CreatehealthBar() {
    let isLandscape = app.view.width > app.view.height;
    
    healthBar = new Container();
    
    if (isLandscape) {
        // Landscape Mode - Horizontal Health Bar
        healthBar.position.set((app.view.width - health) / 2, app.view.height - 60); // 50 units padding from the bottom
    } else {
        // Portrait Mode - Vertical Health Bar
        healthBar.position.set(window.innerWidth / 11, (app.view.height-healthBar.height)/2-150);
    }
    
    gameScene.addChild(healthBar);

    const innerBar = new Graphics();
    innerBar.beginFill(0x000000);
    innerBar.drawRect(0, 0, isLandscape ? health :10, isLandscape ? 10 : health);
    innerBar.endFill();
    healthBar.addChild(innerBar);

    outerBar = new Graphics();
    outerBar.beginFill(0x00FF00);
    outerBar.drawRect(0, 0, isLandscape ? health : 10, isLandscape ? 10: health);
    outerBar.endFill();
    healthBar.addChild(outerBar);

    redBar = new Graphics();
    redBar.beginFill(0xFF3300);
    redBar.drawRect(0, 0, isLandscape ? health : 10, isLandscape ? 10: health);
    redBar.endFill();
    healthBar.addChild(redBar);
}

function checkTransition(){
    let clickedCount = Array.from(batContainer.children).filter(sprite => sprite.isFilled).length;
    let soilCount = Array.from(batContainer.children).filter(sprite => sprite.texture === id["soil01.png"]).length;
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
        health -=10;
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
            batSprite = new Sprite(id["soil01.png"]);

        }
        batSprite.interactive = true;
        batSprite.on('pointerdown', onClick);
        bat1Array.push(batSprite);
        wateringCan.visible=false;
        wateringCan.interactive=false;

    } else if (gameStage === 2 && wateringCanClicked) {
        batSprite = new Sprite(id["soils03@3x.png"]);
        batSprite.interactive = true;
        batSprite.on('pointerdown', onClick);
        
        const index = bat1Array.indexOf(this);
        if (index > -1) {
            bat1Array.splice(index, 1, batSprite);
        } else {
            bat1Array.push(batSprite);
        }
    } else if(gameStage===3 && seedPouchClicked){
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
       // console.log("batSprite has been created");

     batSprite.width=batSize;
     batSprite.height=batSize;
        batSprite.x = this.x;
        batSprite.y = this.y;
        batSprite.isFilled = true;

        this.parent.addChild(batSprite);
        this.parent.removeChild(this); // Remove the original square
      
       checkTransition();
  health -=10;
//console.log("Health decreased to:", health);

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
function createSuccessScene(){
    
   const text = "해냈군요! ▶\n\n당신이 클릭 한 번으로 밭을 갈고 \n\n옥수수를 심는다고 해서, \n\n그게 진짜 농사보다 덜 중요한 건 아니에요. ▶\n\n디지털 세계에서도 '노동'이라는 것은 존재하거든요. ▶\n\n이것을 ‘놀이노동’이라고 해요.";

   successScene=new Container();
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
    
    nextButton.beginFill(0x8A2BE2);
    nextButton.drawRoundedRect(0,0,100,50,50,5);
    nextButton.endFill();
    
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
   app.stage.addChild(nextButton);
}


function CreateGameOverScene(){
     //create gameover scene 
  gameOverScene=new Container();
  app.stage.addChild(gameOverScene);
  gameOverScene.visible=false;
  GameoverText=new PIXI.Text('Game Over!',
  {fontFamily: "Arial", fontSize: 50, fill: "white"});
  GameoverText.x=app.view.width/2-GameoverText.width/2;
  GameoverText.y=app.view.height/2;
  gameOverScene.addChild(GameoverText);
}



function gameLoop(delta){
    //Runs the current game `state` in a loop and renders the sprites
  state(delta);
}   
  
function play(delta) {
    // Increase health over time
    health += 0.05 * delta;

    // Ensure health doesn't exceed maximum
    if (health > 328) {
        health = 328;
    }

    let healthPercentage = (health / 328) * 100;
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
        outerBar.x = 328 - outerBar.width;
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
        outerBar.y = 328 - outerBar.height;
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

function melonClick(){
 health +=50;
 melonClicks--;
     melonCounterText.text = melonClicks;

 if(melonClicks ==0){
  melon.visible=false;
  melon.interactive=false;
  melon.off('pointerdown',melonClick);
 }
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
    app.view.removeEventListener('mousemove', moveCursorSprite);
    app.view.removeEventListener('touchmove', moveCursorSprite);
    app.view.style.cursor = "default"; // Set back to default cursor
    
    createBat();
    createSuccessScene();
    CreateToolBox();
    CreateGuideConsole();
    CreateGameOverScene();

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
   // console.log("Before resetting health:", health);
    health = 328;
   // console.log("After resetting health:", health);

    outerBar.height = health;
    outerBar.y = 328 - health;
    rakeClicked=false;
}