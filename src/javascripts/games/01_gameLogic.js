import * as PIXI from 'pixi.js';

import { app, Container, Sprite, TextureCache, Graphics,resources } from './01_init.js';


     let batContainer,items,melon,melonCounterText;
      let state, maxScale,centerPoint,id,healthBar,outerBar, redBar, GameoverText,toolbox1,toolbox2,toolbox3,toolbox4, gameScene,gameOverScene;
      let gameStage=1;
      let health=328;
      let bat1Array=[];
      let melonClicks=2;

export function setup(){
      console.log("All image files loaded");
      let border=new PIXI.Graphics();
      border.lineStyle(2,0x000000);
      border.drawRect(0,0,app.renderer.width,app.renderer.height);
     // app.stage.addChild(border);
          
      gameScene=new Container();
      app.stage.addChild(gameScene);
      
      const numberOfCol = 4, numberOfRows = 6, spacing =60;     
      id = resources["/images/sprites/game01.json"].textures;
      items=resources["/images/sprites/tools.json"].textures;
      let bg= new Sprite(id["BG_01_750x1200.png"]);


// Calculate scale ratios for width and height
let scaleRatioWidth = app.view.width / bg.width;
let scaleRatioHeight = app.view.height / bg.height;

// Use the larger of the two to ensure the sprite fills the screen
 maxScale = Math.max(scaleRatioWidth, scaleRatioHeight);

// Set the sprite's scale
bg.scale.set(maxScale);
// Center the sprite in the app view
bg.anchor.set(0.5, 0.5);
bg.x = app.view.width / 2;
bg.y = app.view.height / 2;


gameScene.addChild(bg);
      
      batContainer = new Container();
     const scaledSize = 108 * maxScale; // Calculate the scaled size of each spot

      for(let i = 0; i < numberOfCol; i++) {
          for(let j = 0; j < numberOfRows; j++) {
              let batSpot=new PIXI.Graphics();
              batSpot.beginFill(0xFFFFFF,0.4);
              batSpot.drawRect(0,0,scaledSize,scaledSize);
              batSpot.endFill();
              batSpot.isFilled=false;
              
              const x = spacing * i;
              const y = spacing * j;
              batSpot.x = x;
              batSpot.y = y;
              batSpot.interactive=true;
              batSpot.cursor='pointer';
              batSpot.on('pointerdown',onClick);
              batContainer.addChild(batSpot);
      }
  }
  batContainer.x=(app.view.width-batContainer.width)/2;
  batContainer.y=(app.view.height-500);
 
  gameScene.addChild(batContainer);
  
 let toolboxHeight=app.view.height-100;
  //tool box
  
  toolbox1= new PIXI.Graphics();
 toolbox1.beginFill(0xFFFFFF,0.3);
 toolbox1.drawRect(0,0,scaledSize,scaledSize);
 toolbox1.endFill();
  toolbox1.x= (app.view.width-batContainer.width)/2;
  toolbox1.y= toolboxHeight;
  gameScene.addChild(toolbox1);
  
 

  toolbox2= new PIXI.Graphics();
  toolbox2.beginFill(0xFFFFFF,0.3);
 toolbox2.drawRect(0,0,scaledSize,scaledSize);
 toolbox2.endFill();
  toolbox2.x= (app.view.width-batContainer.width)/2+spacing;
   toolbox2.y= toolboxHeight;
   gameScene.addChild(toolbox2);
  
   toolbox3= new PIXI.Graphics();
 toolbox3.beginFill(0xFFFFFF,0.3);
 toolbox3.drawRect(0,0,scaledSize,scaledSize);
 toolbox3.endFill();
  toolbox3.x= (app.view.width-batContainer.width)/2+spacing*2;
   toolbox3.y= toolboxHeight;
   gameScene.addChild(toolbox3);

   toolbox4= new PIXI.Graphics();
  toolbox4.beginFill(0xFFFFFF,0.3);
 toolbox4.drawRect(0,0,scaledSize,scaledSize);
 toolbox4.endFill();
  toolbox4.x= (app.view.width-batContainer.width)/2+spacing*3;
   toolbox4.y= toolboxHeight;
   gameScene.addChild(toolbox4);
   
  melon=new Sprite(items["items_0004_Melon.png"]);
  melon.scale.set(maxScale);
  melon.x=toolbox4.x;
  melon.y=toolbox4.y;
  melon.interactive = true;
  melon.on('pointerdown', onClick2);
  gameScene.addChild(melon);
  melonCounterText = new PIXI.Text(melonClicks, { fontFamily: 'Arial', fontSize: 12, fill: 'black' });
melonCounterText.x = toolbox4.x+10;  // Set the position where you want it on the screen
melonCounterText.y = toolbox4.y-10;
gameScene.addChild(melonCounterText);
  
 CreatehealthBar();

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
  app.ticker.add((delta)=> gameLoop(delta));

//end of setup function
}

function CreatehealthBar(){

 healthBar = new Container();
    healthBar.position.set(window.innerWidth / 8, 160);
    gameScene.addChild(healthBar);

    // Create the black background rectangle
    const innerBar = new Graphics();
    innerBar.beginFill(0x000000);
    innerBar.drawRect(0, 0, 8, 328);
    innerBar.endFill();
    healthBar.addChild(innerBar);

    // Create the front green rectangle
    outerBar = new Graphics();
    outerBar.beginFill(0x00FF00);  // Green
    outerBar.drawRect(0, 0, 8, 328);
    outerBar.endFill();
    healthBar.addChild(outerBar);

    // Create the front red rectangle
    redBar = new Graphics();
    redBar.beginFill(0xFF3300);  // Red
    redBar.drawRect(0, 0, 8, 328);
    redBar.endFill();
    healthBar.addChild(redBar);
}
function onClick(){
  
  if(this.isFilled){
   return; //if it's filled, just return and don't do anything
  }
  
 let batSprite;

    if (gameStage === 1) {
        batSprite = new Sprite(id["soil01.png"]);
        batSprite.interactive = true;
        batSprite.on('pointerdown', onClick);
        bat1Array.push(batSprite);
    } else if (gameStage === 2) {
        batSprite = new Sprite(id["soil02.png"]);
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
        batSprite.scale.set(maxScale);
        batSprite.x = this.x;
        batSprite.y = this.y;
        batSprite.isFilled = true;

        this.parent.addChild(batSprite);
        this.parent.removeChild(this); // Remove the original square

        let clickedCount = Array.from(batContainer.children).filter(sprite => sprite.isFilled).length;
        let totalSpots = 4* 6; // We know the exact number of spots from the loop
        if (clickedCount === totalSpots) {
            transitionToStage2();
        }
  
  health -=10;
}
else if(gameStage===2){
   let bat2= new Sprite(id["soil02.png"]);
   bat2.scale.set(maxScale);
   bat2.x=this.x;
   bat2.y=this.y ;
   bat2.isFilled=true;
   bat2.interactive=true;
   
   bat2.on('pointerdown',onClick);
   
   this.parent.addChild(bat2);
   this.parent.removeChild(this);
   
   const index=bat1Array.indexOf(this);
   if(index >-1){
    bat1Array.splice(index,1,bat2);
   }else{
    bat1Array.push(bat2);
   }
   
   
   health -= 10;
}
}

function onClick2(){
 health +=20;
 melonClicks++;
     melonCounterText.text = 2-melonClicks;

 if(melonClicks >=2){
  melon.visible=false;
  melon.interactive=false;
  melon.off('pointerdown',onClick2);
  
 }
}

function transitionToStage2(){
  gameStage =2;
  console.log("transitioned to stage 2");
  
  //reset isFilled for all spots for stage 2
  Array.from(batContainer.children).forEach(sprite => {
   sprite.isFilled=false;
  });
}

function gameLoop(delta){
    //Runs the current game `state` in a loop and renders the sprites
  state(delta);
}   
  
function play(delta){
  // Increase health over time
    health += 0.05 * delta;

    // Ensure health doesn't exceed maximum
    if (health > 328) {
        health = 328;
    }

    // Determine heights based on current health
    let healthPercentage = (health / 328) * 100;

    if (healthPercentage > 50) {
        outerBar.height = health;
        redBar.height = 0;  // Hide red bar when green bar is dominant
    } else {
        redBar.height =  health;  
        outerBar.height = 0;  
    }

    // Set the position of the green bar to start from the top
    outerBar.y = 328 - outerBar.height;

    // Set the position of the red bar to start where the green bar ends
    redBar.y = outerBar.y - redBar.height; 

    if (health <= 0) {
        state = end;
    }


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


function restartGame(){
  app.ticker.start();

    // Remove all children from batContainer
    batContainer.removeChildren();

    // Recreate the clickable batSpots inside batContainer
    const numberOfCol = 4, numberOfRows = 6, spacing = 60;

    for(let i = 0; i < numberOfCol; i++) {
        for(let j = 0; j < numberOfRows; j++) {
            let batSpot = new PIXI.Graphics();
            batSpot.beginFill(0xFFFFFF, 0.5); // Adding some transparency
            batSpot.drawRect(0, 0, 108*maxScale, 108*maxScale);
            batSpot.endFill();
            batSpot.isFilled = false;

            const x = spacing * i;
            const y = spacing * j;
            batSpot.x = x;
            batSpot.y = y;

            batSpot.interactive = true;
            batSpot.cursor = 'pointer';
            batSpot.on('pointerdown', onClick);

            batContainer.addChild(batSpot);
        }
    }

    // Reset health and related UI
    health = 328;
    outerBar.height = health;
    outerBar.y = 328 - health;

    gameScene.visible = true;
    gameOverScene.visible = false;

    gameStage = 1;

    // Restart the game loop
    state = play;
}