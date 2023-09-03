import * as PIXI from 'pixi.js';

import { app, Container, Sprite, TextureCache, Graphics,resources,resolution } from './02_init.js';

   let countdownText,id,soils,bgSprites,batContainer,gameScene,gameOverScene, GameoverText,state, bg;
    let countdownTime=100;
    let lastTime=Date.now();
    let cornSprite1, cornAni1;
    let scale,batSize,retryButton,exitButton,YesButton,NoButton;
 //밭 한칸당 4점 x 24 = 96점
let score=96;
let ecoPoint=0;
 
    // Assuming your 750px wide window fits 4 columns with 60 spacing in portrait
    const baseWindowWidth = 750 / 2;

    scale = app.view.width / baseWindowWidth;

    const baseBatSize = 30; // Original rectangle size

    batSize = baseBatSize * scale;
 

export function setup(){
   
   
    bgSprites= resources["/images/sprites/bg-soil-glitch.json"].textures;
    cornSprite1=resources["/images/sprites/corn01.png"].texture;
    id=resources["/images/sprites/myJason.json"].textures;
    soils=resources["/images/sprites/soils.json"].textures;

    gameScene=new Container();
    app.stage.addChild(gameScene);     
  
  createCountdown();
  
  createBat();

  createGameOverScene();
  
  createRetryButtons();
  createYesorNoButtons();
  state=play;
   
  app.ticker.add(gameLoop);
}


function createCountdown(){
     if (countdownText) {
        gameScene.removeChild(countdownText);
        countdownText = null;
    }
    countdownText=new PIXI.Text('60', {fontFamily:'Arial',fontSize:36,fill:'black'});
  countdownText.x=(app.view.width/resolution)/2;
  countdownText.y=30;
  countdownText.anchor.set(0.5);
  gameScene.addChild(countdownText);
}
function createBat(){
      let numberOfCol = 4, numberOfRows = 6;     
  let cornFrames = getCornFrames();

   batContainer = new Container();

for(let i = 0; i < numberOfCol; i++) {
    for(let j = 0; j < numberOfRows; j++) {
        let batSpot=new Sprite(soils["soils03@3x.png"]);
         batSpot.isFilled=false;
         batSpot.width=batSize;
         batSpot.height=batSize;
        const x = batSize* i;
        const y = batSize * j;
        batSpot.x = x;
        batSpot.y = y;
        batContainer.addChild(batSpot);

        cornAni1=new PIXI.AnimatedSprite(cornFrames);
        cornAni1.isFilled=false;
        cornAni1.interactive=true;
        cornAni1.width=batSize;
        cornAni1.height=batSize;
        cornAni1.x=batSpot.x;
        cornAni1.y=batSpot.y;
        cornAni1.animationSpeed=0.1;
        cornAni1.play();

        cornAni1.isLeftmost = (i===0);
        
        cornAni1.isRightmost = (i===numberOfCol-1);
        
        cornAni1.isUppermost =(j ===0);
        
        cornAni1.isBottommost= (j ===numberOfRows-1);
        batContainer.addChild(cornAni1);
}
}

batContainer.x = ((app.view.width/resolution) - batContainer.width) / 2;
batContainer.y = ((app.view.height/resolution) - batContainer.height) / 2;
gameScene.addChild(batContainer);
}
function createGameOverScene(){
    //create gameover scene 
  gameOverScene=new Container();
  app.stage.addChild(gameOverScene);
  gameOverScene.visible=false;
  GameoverText=new PIXI.Text('Game Over!',
  {fontFamily: "Arial", fontSize: 50, fill: "black"});
  GameoverText.x=app.view.width/2-GameoverText.width/2;
  GameoverText.y=app.view.height/2;
  gameOverScene.addChild(GameoverText);
  
}

function createRetryButtons(){
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
let retryText = new PIXI.Text('Retry', {fontFamily : 'Arial', fontSize: 24, fill : 0xffffff});
let exitText = new PIXI.Text('Exit', {fontFamily : 'Arial', fontSize: 24, fill : 0xffffff});

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

function createYesorNoButtons(){
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
let YesText = new PIXI.Text('네', {fontFamily : 'Arial', fontSize: 24, fill : 0xffffff});
let NoText = new PIXI.Text('아니오', {fontFamily : 'Arial', fontSize: 24, fill : 0xffffff});

YesText.position.set((YesButton.width - YesText.width) / 2, (YesButton.height - YesText.height) / 2);
NoText .position.set(( NoButton.width - NoText .width) / 2, ( NoButton.height - NoText .height) / 2);

YesButton.addChild(YesText);
 NoButton.addChild(NoText);

// Initially set them invisible
YesButton.visible = false;
 NoButton.visible = false;

// Add them to your stage
app.stage.addChild(YesButton);
app.stage.addChild(NoButton);
}
function showButtons(){
    //show buttons
  retryButton.position.set(app.screen.width / 2 - retryButton.width / 2, app.screen.height / 2);
    exitButton.position.set(app.screen.width / 2 - exitButton.width / 2, retryButton.y + retryButton.height + 10);

    retryButton.visible = true;
    exitButton.visible = true;

}

function showYesorNoButtons(){
    YesButton.position.set(app.screen.width / 2 - YesButton.width / 2, app.screen.height / 2);
    NoButton.position.set(app.screen.width / 2 - NoButton.width / 2, YesButton.y + YesButton.height + 10);

    YesButton.visible = true;
    NoButton.visible = true;
}

function getCornFrames(){
    const totalFrames=2;
    const spriteSheetTexture=cornSprite1;
    const singleFrameWidth = spriteSheetTexture.baseTexture.width / totalFrames;
    let frames = [];

    for (let i = 0; i < totalFrames; i++) {
        let frame = new PIXI.Rectangle(singleFrameWidth * i, 0, singleFrameWidth, spriteSheetTexture.baseTexture.height);
        let textureFrame = new PIXI.Texture(spriteSheetTexture.baseTexture, frame);
        frames.push(textureFrame);
    }

    return frames;
}

function resumeYes(){
    ecoPoint --;
    resume();
}
function resumeNo(){
    ecoPoint++;
    resume();
}
function resume(){
    app.ticker.start();
}
function gameLoop(delta) {
  //Runs the current game `state` in a loop and renders the sprites
  play(delta);

  if(countdownTime <=0){
    end();
  }
  
  
}

function play(delta) {
  //All the game logic goes here
  let currentTime=Date.now();
  let deltaTime=(currentTime-lastTime)/1000;
  //countdown logic 
  countdownTime -= deltaTime;

  if(countdownTime <=0){
    countdownTime=0;
  }
  countdownText.text= Math.floor(countdownTime).toString();

  lastTime=currentTime;

 if(countdownTime <= 70 && countdownTime >= 40){
    if(Math.random() < 0.01){  //1% chance every frame
      generateSprite();
    }
  }

  handleCollisions();
  
  if(countdownTime <=20){
      app.ticker.stop();
      if(score >=40){
          console.log("success");
           let successText = new PIXI.Text('살충제를 살포할까요?', { fontFamily: 'Arial', fontSize: 32, fill: 0x00FF00 });
        successText.x = (app.view.width - successText.width) / 2;  // centering the text
        successText.y = (app.view.height - successText.height) / 2; // centering the text
            gameScene.addChild(successText);
           showYesorNoButtons();
           
      }else{
          console.log("fail. score is", score);
          showButtons();
      }
  }
}
function checkCollision(sprite,targetSprite){
   if (!(sprite instanceof PIXI.Sprite) || !(targetSprite instanceof PIXI.Sprite)) {
        return false;
    }
    
    let spriteBounds = sprite.getBounds();
    let spotBounds = targetSprite.getBounds();

    return spriteBounds.x + spriteBounds.width > spotBounds.x &&
           spriteBounds.x < spotBounds.x + spotBounds.width &&
           spriteBounds.y + spriteBounds.height > spotBounds.y &&
           spriteBounds.y < spotBounds.y + spotBounds.height;
}


function handleCollisions(){
    app.stage.children.forEach(child => {
        if (child instanceof PIXI.Sprite && child.vx && child.vy) {
            let hasCollided = false;

            for(let i = batContainer.children.length - 1; i >= 0; i--) {
                let currentCorn = batContainer.children[i];
               if (!currentCorn.isFilled && 
       (currentCorn.isLeftmost || currentCorn.isRightmost || currentCorn.isUppermost || currentCorn.isBottommost) && 
       checkCollision(child, currentCorn)) {
           score -=4;
           console.log(score);
                    currentCorn.isFilled = true;
                    hasCollided = true;
                    child.vx = 0; // Stop sprite from moving in x direction
                    child.vy = 0; // Stop sprite from moving in y direction
                    child.isCollided=true;
                    
                    overlayGlitch(currentCorn);
                    batContainer.removeChild(currentCorn);  // Remove the corn sprite from the container
                    
                    break; // since one random sprite should only collide with one cornSprite at most
                    
                }
            }
            
            if (!hasCollided) {
                child.x += child.vx * child.speed;
                child.y += child.vy * child.speed;
            }
        }
    });
}

function overlayGlitch(cornSprite){
    let overlay= new Sprite(bgSprites["Decay_glitch_3x_0000.png"]);
    overlay.scale.set(0.2);
    overlay.x=cornSprite.x;
    overlay.y=cornSprite.y;
    
    batContainer.addChild(overlay);
   // cornSprite.interactive=false;
}

function generateSprite(){
  let frameNames=Object.keys(id);
  //randomly select a frame name
  let randomFrameName=frameNames[Math.floor(Math.random()* frameNames.length)];

  let sprite= new PIXI.Sprite(id[randomFrameName]);
  sprite.scale.set(0.2);
  sprite.isCollided=false;
  //randomly position the sprite on the canvas
  let randomSide= Math.floor(Math.random() *4);
  switch (randomSide){
    case 0: //top
      sprite.x=Math.random() * app.view.width;
      sprite.y=0;
      break;
    case 1: //right
      sprite.x=app.view.width;
      sprite.y=Math.random() *app.view.height;
      break;
    case 2: //bottom
      sprite.x=Math.random()* app.view.width;
      sprite.y=app.view.height;
      break;
    case 3: //left
      sprite.x=0;
      sprite.y=Math.random()*app.view.height;
      break;
  }

  //calculate the direction towards the center of the canvas
  let directionX=app.view.width/2-sprite.x;
  let directionY=app.view.height/2-sprite.y;
  let length=Math.sqrt(directionX *directionX +directionY*directionY);
  sprite.vx=directionX/length;
  sprite.vy=directionY/length;

  //set a random speed
  sprite.speed=Math.random()*3 +2; //random speed between 2 to 5

  app.stage.addChild(sprite);
  
  sprite.interactive=true;
  sprite.on('pointerdown', pushSpriteAway);
  return sprite;
}

function pushSpriteAway(event){
    let sprite=event.currentTarget;
    let interactionData=event.data;
    let globalPosition=interactionData.global;
    

        //calculate direction from sprite to pointer position
        let dx=globalPosition.x-sprite.x;
        let dy=globalPosition.y-sprite.y;
        let distance=Math.sqrt(dx *dx +dy *dy);
        
         // Normalize the direction and set a push force
        let pushForce = 10; // You can adjust this value
        sprite.vx = -(dx / distance) * pushForce;
        sprite.vy = -(dy / distance) * pushForce;
        
        // You might want to reset the isCollided flag if you want further interactions
        sprite.isCollided = false;
}

function exitGame(){
    console.log("exitgame");
}

function end() {
  app.ticker.remove(gameLoop);
   gameScene.visible=false;
  gameOverScene.visible=true;
  GameoverText.visible=true;
  console.log("Game OVER!");
  app.ticker.stop();
   setTimeout(()=>{
      restartGame();
  },1000); //1 second delay
}

function restartGame(){
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
    countdownTime = 60;

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