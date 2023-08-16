import * as PIXI from 'pixi.js';

import { app, Container, Sprite, TextureCache, Graphics,resources } from './02_init.js';

   let countdownText,id,batContainer,gameScene,gameOverScene, GameoverText,state;
    let countdownTime=60;
    let lastTime=Date.now();

export function setup(){
      id = resources["/images/sprites/myJason.json"].textures;

    gameScene=new Container();
    app.stage.addChild(gameScene);     

  countdownText=new PIXI.Text('60', {fontFamily:'Arial',fontsize:36,fill:'white'});
  countdownText.x=app.view.width/2;
  countdownText.y=30;
  countdownText.anchor.set(0.5);
  gameScene.addChild(countdownText);
  app.ticker.add(gameLoop);
  
   const numberOfCol = 4, numberOfRows = 6, spacing =40;     
      id = resources["/images/sprites/myJason.json"].textures;
      batContainer = new Container();

      for(let i = 0; i < numberOfCol; i++) {
          for(let j = 0; j < numberOfRows; j++) {
              let batSpot=new Sprite(id["bat.png"]);
              batSpot.isFilled=false;
              //bat.anchor.set(0.5);
              batSpot.scale.set(0.2);
              const x = spacing * i;
              const y = spacing * j;
              batSpot.x = x;
              batSpot.y = y;
              batSpot.interactive=true;
              batSpot.cursor='pointer';
              //batSpot.on('pointerdown',onClick);
              batContainer.addChild(batSpot);
      }
  }
  batContainer.x=app.view.width/2-(batContainer.width/2); 
  batContainer.y=app.view.height/2-(batContainer.height/2);
  gameScene.addChild(batContainer);
  
  //create gameover scene 
  gameOverScene=new Container();
  app.stage.addChild(gameOverScene);
  gameOverScene.visible=false;
  GameoverText=new PIXI.Text('Game Over!',
  {fontFamily: "Arial", fontSize: 50, fill: "white"});
  GameoverText.x=app.view.width/2-GameoverText.width/2;
  GameoverText.y=app.view.height/2;
  gameOverScene.addChild(GameoverText);
  
  state=play;
}

function checkCollision(sprite,batSpot){
   if (!(sprite instanceof PIXI.Sprite) || !(batSpot instanceof PIXI.Sprite)) {
        return false;
    }
    
    let spriteBounds = sprite.getBounds();
    let spotBounds = batSpot.getBounds();

    return spriteBounds.x + spriteBounds.width > spotBounds.x &&
           spriteBounds.x < spotBounds.x + spotBounds.width &&
           spriteBounds.y + spriteBounds.height > spotBounds.y &&
           spriteBounds.y < spotBounds.y + spotBounds.height;
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

            batContainer.children.forEach(batSpot => {
                if (!batSpot.isFilled && checkCollision(child, batSpot)) {
                    batSpot.isFilled = true;
                    hasCollided = true;
                    child.vx = 0; // Stop sprite from moving in x direction
                    child.vy = 0; // Stop sprite from moving in y direction
                    child.isCollided=true;
                }
            });

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
    
    if(sprite.isCollided){
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
}

function end() {
  app.ticker.remove(gameLoop);
   gameScene.visible=false;
  gameOverScene.visible=true;
  GameoverText.visible=true;
  console.log("Game OVER!");
   setTimeout(()=>{
      restartGame();
  },1000); //1 second delay
}

function restartGame(){
  app.ticker.start();
  app.ticker.add(gameLoop);
  
  // Remove all sprites except batSpots
    for (let i = app.stage.children.length - 1; i >= 0; i--) {
        let child = app.stage.children[i];
        if (child instanceof PIXI.Sprite && child !== batContainer) {
            app.stage.removeChild(child);
        }
    }
  // Iterate through all the children of batContainer to make them clickable again
  Array.from(batContainer.children).forEach(batSpot => {
   if(batSpot.texture===id["bat.png"]){   //only attach the event to the bat spots
    batSpot.isFilled=false;  //reset isFilled status
    // if the appearance of the batSpot changes upon collision, reset it here
            // e.g., batSpot.alpha = 1; // or any other properties that change
            // batSpot.on('pointerdown', onClick); // if you want to attach an event handler
//batSpot.on('pointerdown', onClick); //attach the event handler
   }
  });
  
  countdownTime=60;
  
  gameScene.visible=true;
  gameOverScene.visible=false;
  //start the game loop again
  state=play;
}