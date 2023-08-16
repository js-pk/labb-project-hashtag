import * as PIXI from 'pixi.js';

import { app, Container, Sprite, TextureCache, Graphics,resources } from './01_init.js';


     let batContainer;
      let state, centerPoint,id,healthBar,outerBar, GameoverText,toolbox1,toolbox2,toolbox3,toolbox4, gameScene,gameOverScene;
      let gameStage=1;
      let health=328;
      let bat1Array=[];

export function setup(){
      console.log("All image files loaded");
      let border=new PIXI.Graphics();
      border.lineStyle(2,0x000000);
      border.drawRect(0,0,app.renderer.width,app.renderer.height);
      app.stage.addChild(border);
          
      gameScene=new Container();
      app.stage.addChild(gameScene);
    
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
              batSpot.on('pointerdown',onClick);
              batContainer.addChild(batSpot);
      }
  }
  batContainer.x=(app.view.width-batContainer.width)/2;
  batContainer.y=(app.view.height-350);
  gameScene.addChild(batContainer);
  
  let toolboxHeight=app.view.height-100;
  //tool box
  toolbox1= new Sprite(id["tool-box.png"]);
 
  toolbox1.scale.set(0.2);
  toolbox1.x= (app.view.width-batContainer.width)/2;
  toolbox1.y= toolboxHeight;
  gameScene.addChild(toolbox1);

  toolbox2= new Sprite(id["tool-box.png"]);
 
  toolbox2.scale.set(0.2);
  toolbox2.x= (app.view.width-batContainer.width)/2+spacing;
  toolbox2.y= toolboxHeight;
  gameScene.addChild(toolbox2);
  
  toolbox3= new Sprite(id["tool-box.png"]);

  toolbox3.scale.set(0.2);
  toolbox3.x= (app.view.width-batContainer.width)/2+spacing*2;
  toolbox3.y= toolboxHeight;
  gameScene.addChild(toolbox3);

  toolbox4= new Sprite(id["tool-box.png"]);
 
  toolbox4.scale.set(0.2);
  toolbox4.x= (app.view.width-batContainer.width)/2+spacing*3;
  toolbox4.y= toolboxHeight;
  gameScene.addChild(toolbox4);
  
  //create the health bar
  healthBar=new Container();
  healthBar.position.set(30,154);
  gameScene.addChild(healthBar);
  //Create the black background rectangle
  const innerBar = new Graphics();
  innerBar.beginFill(0x000000);
  innerBar.drawRect(0, 0, 8, 328);
  innerBar.endFill();
  healthBar.addChild(innerBar);
  //Create the front red rectangle
  outerBar = new Graphics();
  outerBar.beginFill(0xFF3300);
  outerBar.drawRect(0,0,8, 328);
  outerBar.endFill();
  healthBar.addChild(outerBar);

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

function onClick(){
  
  if(this.isFilled){
   return; //if it's filled, just return and don't do anything
  }
  
  if(gameStage===1){
      let bat1 = new Sprite(id["120-kaki.png"]);
      bat1.scale.set(0.3);
      bat1.x = this.x ;
      bat1.y = this.y;
      this.parent.addChild(bat1); // Add corn to the same container as the bat
      bat1.isFilled=true;
  
      bat1.interactive=true;
      bat1.on('pointerdown',onClick);
  
      bat1Array.push(bat1);
      this.off('pointerdown', onClick);
  
 // Check if all batContainer spots are filled with bat1
  let bat1Count= Array.from(batContainer.children).filter(sprite => sprite.isFilled).length;
  let originalBatCount= Array.from(batContainer.children).filter(sprite => sprite.texture=== id["bat.png"]).length;
  if(bat1Count===originalBatCount){
  
          transitionToStage2();
      }
  
  
  health -=10;
}
else if(gameStage===2){
   let bat2= new Sprite(id["120-sky.png"]);
   bat2.scale.set(0.3);
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
    //All the game logic goes here
//increase health over time
health += 0.05 *delta;
//ensure health doesn't exceed maximum
if(health>328){
  health=328;}

outerBar.height=health;
outerBar.y=328-health;
if(health<=0){
  state=end;}
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
 
  let children= Array.from(batContainer.children);
  for(let sprite of children){
   if(sprite.texture===id["120-kaki.png"]|| sprite.texture===id["120-sky.png"]){
    batContainer.removeChild(sprite);
   }
  }
  
  bat1Array=[];
  
  // Iterate through all the children of batContainer to make them clickable again
  Array.from(batContainer.children).forEach(batSpot => {
   if(batSpot.texture===id["bat.png"]){   //only attach the event to the bat spots
    batSpot.isFilled=false;  //reset isFilled status
    batSpot.on('pointerdown', onClick); //attach the event handler
   }
  });
  
  health=328;
  outerBar.height=health;
  outerBar.y=328-health;
  gameScene.visible=true;
  gameOverScene.visible=false;
  
  gameStage=1;
  //start the game loop again
  state=play;
}