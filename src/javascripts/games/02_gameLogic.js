import * as PIXI from 'pixi.js';

import { app, Container, Sprite, TextureCache, Graphics,resources } from './02_init.js';

   let countdownText,id,maxScale, bgSprites,batContainer,gameScene,gameOverScene, GameoverText,state, bg;
    let countdownTime=60;
    let lastTime=Date.now();
    let cornSprite1, cornAni1;

export function setup(){
    id = resources["/images/sprites/myJason.json"].textures;
    bgSprites= resources["/images/sprites/bg-soil-glitch.json"].textures;
    cornSprite1=resources["/images/sprites/corn01.png"].texture;
    gameScene=new Container();
    app.stage.addChild(gameScene);     

  
  
   const numberOfCol = 4, numberOfRows = 6, spacing =100;     
bg= new Sprite(bgSprites["BG_01_750x1200.png"]);


// Calculate scale ratios for width and height
let scaleRatioWidth = app.view.width / bg.width;
let scaleRatioHeight = app.view.height / bg.height;

// Use the larger of the two to ensure the sprite fills the screen
 maxScale = Math.max(scaleRatioWidth, scaleRatioHeight);
 bg.scale.set(maxScale);
 bg.anchor.set(0.5,0.5);
 bg.x=app.view.width/2;
 bg.y=app.view.height/2;
 gameScene.addChild(bg);
 
 countdownText=new PIXI.Text('60', {fontFamily:'Arial',fontSize:36,fill:'black'});
  countdownText.x=app.view.width/2;
  countdownText.y=30;
  countdownText.anchor.set(0.5);
  gameScene.addChild(countdownText);
  app.ticker.add(gameLoop);
  
  
      batContainer = new Container();
let cornFrames = getCornFrames();


      for(let i = 0; i < numberOfCol; i++) {
          for(let j = 0; j < numberOfRows; j++) {
              let batSpot=new Sprite(bgSprites["soil01.png"]);
               batSpot.isFilled=false;
              batSpot.scale.set(maxScale);
              batSpot.anchor.set(0.5,0.5);
              const x = (spacing * i + (spacing / 2)) * maxScale; // Adjust position
              const y = (spacing * j + (spacing / 2)) * maxScale; // Adjust position
              batSpot.x = x;
              batSpot.y = y;
           //   batSpot.interactive=true;
              //batSpot.cursor='pointer';
              cornAni1=new PIXI.AnimatedSprite(cornFrames);
              cornAni1.isFilled=false;
              cornAni1.interactive=true;
              cornAni1.anchor.set(0.5,0.5);
              cornAni1.scale.set(maxScale);
              cornAni1.x=batSpot.x;
              cornAni1.y=batSpot.y;
              cornAni1.animationSpeed=0.1;
              cornAni1.play();
              
              cornAni1.isLeftmost = (i===0);
              
              cornAni1.isRightmost = (i===numberOfCol-1);
              
              cornAni1.isUppermost =(j ===0);
              
              cornAni1.isBottommost= (j ===numberOfRows-1);
          //  batContainer.addChild(batSpot);
              batContainer.addChild(cornAni1);
      }
  }
     const totalWidth=numberOfCol *spacing *maxScale;
     const totalHeight=numberOfRows *spacing *maxScale;
  batContainer.x=app.view.width/2-totalWidth/2; 
  batContainer.y=app.view.height/2-totalHeight/2;
  gameScene.addChild(batContainer);
  
  //create gameover scene 
  gameOverScene=new Container();
  app.stage.addChild(gameOverScene);
  gameOverScene.visible=false;
  GameoverText=new PIXI.Text('Game Over!',
  {fontFamily: "Arial", fontSize: 50, fill: "black"});
  GameoverText.x=app.view.width/2-GameoverText.width/2;
  GameoverText.y=app.view.height/2;
  gameOverScene.addChild(GameoverText);
  
  state=play;
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

function overlayGlitch(cornSprite){
    let overlay= new Sprite(bgSprites["Decay_glitch_3x_0000.png"]);
    overlay.scale.set(0.2);
    overlay.x=cornSprite.x;
    overlay.y=cornSprite.y;
    
    batContainer.addChild(overlay);
   // cornSprite.interactive=false;
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

  countdownTime -= deltaTime;

  if(countdownTime <=0){
    countdownTime=0;
  }
  countdownText.text= Math.floor(countdownTime).toString();

  lastTime=currentTime;

  if(Math.random() <0.01){  //1% chance every frame
    generateSprite();
  }

  app.stage.children.forEach(child => {
        if (child instanceof PIXI.Sprite && child.vx && child.vy) {
            let hasCollided = false;

            for(let i = batContainer.children.length - 1; i >= 0; i--) {
                let currentCorn = batContainer.children[i];
               if (!currentCorn.isFilled && 
       (currentCorn.isLeftmost || currentCorn.isRightmost || currentCorn.isUppermost || currentCorn.isBottommost) && 
       checkCollision(child, currentCorn)) {
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
// Stop the ticker first
    
    
    // Cleanup: Remove all sprites on the stage except for batContainer, bg, and gameOverScene
    app.stage.children.slice().forEach(child => {
        if (child !== batContainer && child !== bg && child !== gameOverScene) {
            app.stage.removeChild(child);
        }
    });

    // Clear the batContainer but keep it on stage
    batContainer.removeChildren();

    // Repopulate the corn sprites
    // Use the same logic you have in your setup() function 
    // If you wrap the corn generation in a separate function, it's easier, 
    // e.g., populateCornSprites();

    // Reset game states and visibility
    countdownTime = 60;
    gameScene.visible = true;
    gameOverScene.visible = false;
    state = play;

    // Add gameLoop back to the ticker
    app.ticker.add(gameLoop);
    
    // Start the ticker
    app.ticker.start();
}