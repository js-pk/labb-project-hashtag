//checking PIXI is linking
 import * as PIXI from 'pixi.js';
 
  //Aliases
      const Application = PIXI.Application,
          Container = PIXI.Container,
          loader = PIXI.Loader.shared,
          resources = PIXI.Loader.shared.resources,
          TextureCache = PIXI.utils.TextureCache,
          Sprite = PIXI.Sprite,
          Rectangle = PIXI.Rectangle,
          Graphics=PIXI.Graphics;
          

    //create a Pixi app using Application object-automatically generate an HTML <canvas>
       const ratio=16/10;
       const width=window.innerWidth;
       const height=window.innerWidth *ratio;
       let app=new PIXI.Application(
        {width:width,height:height,antialias:true, transparent:false, resolution:window.innerWidth.devicePixelRatio || 1
        });
   
        app.renderer.backgroundColor= 0xAAAAAA;
        app.renderer.autoDensity=true;
        app.renderer.view.style.position="absolute";
        app.renderer.view.style.display="block";
        app.renderer.autoDensity=true;
        

    document.getElementById("gameContainer").appendChild(app.view);        

PIXI.Loader.shared.onProgress.add(loadProgressHandler)
    PIXI.Loader.shared
        .add("/images/sprites/myJason.json")
        .load(setup);
        
        function loadProgressHandler(loader,resource){
            console.log("loading:" +resource.url);
            console.log("progress: " +loader.progress +"%");
        }
        
        let state, centerPoint,id,healthBar,outerBar, GameoverText,toolbox1,toolbox2,toolbox3,toolbox4, gameScene,gameOverScene;
        let health=328;
        

function setup(){
        console.log("All image files loaded");
        let border=new PIXI.Graphics();
        border.lineStyle(2,0x000000);
        border.drawRect(0,0,app.renderer.width,app.renderer.height);
        app.stage.addChild(border);
            
        gameScene=new Container();
        app.stage.addChild(gameScene);
       

        const numberOfCol = 4, numberOfRows = 6, spacing =57;     
        id = resources["/images/sprites/myJason.json"].textures;
        let batContainer = new Container();

        for(let i = 0; i < numberOfCol; i++) {
            for(let j = 0; j < numberOfRows; j++) {
                let bat=new Sprite(id["bat.png"]);
                //bat.anchor.set(0.5);
                bat.scale.set(0.3);
                const x = spacing * i;
                const y = spacing * j;
                bat.x = x;
                bat.y = y;
                bat.interactive=true;
                bat.cursor='pointer';
                bat.on('pointerdown',onClick);
                batContainer.addChild(bat);
        }
    }
    batContainer.x=(app.view.width-batContainer.width)/2;
    batContainer.y=(app.view.height-650);
    gameScene.addChild(batContainer);
    
    //tool box
    toolbox1= new Sprite(id["tool-box.png"]);
   
    toolbox1.scale.set(0.3);
    toolbox1.x= (app.view.width-batContainer.width)/2;
    toolbox1.y= batContainer.y +420;
    gameScene.addChild(toolbox1);

    toolbox2= new Sprite(id["tool-box.png"]);
   
    toolbox2.scale.set(0.3);
    toolbox2.x= (app.view.width-batContainer.width)/2+57;
    toolbox2.y= batContainer.y +420;
    gameScene.addChild(toolbox2);
    
    toolbox3= new Sprite(id["tool-box.png"]);
 
    toolbox3.scale.set(0.3);
    toolbox3.x= (app.view.width-batContainer.width)/2+57+57;
    toolbox3.y= batContainer.y +420;
    gameScene.addChild(toolbox3);

    toolbox4= new Sprite(id["tool-box.png"]);
   
    toolbox4.scale.set(0.3);
    toolbox4.x= (app.view.width-batContainer.width)/2+57+57+57;
    toolbox4.y= batContainer.y +420;
    gameScene.addChild(toolbox4);
    
    //create the health bar
    healthBar=new Container();
    healthBar.position.set(30,354);
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
    let corn = new Sprite(id["120-kaki.png"]);
    
    corn.scale.set(0.3);
    corn.x = this.x +corn.width/4;
    corn.y = this.y +corn.width/4;
    this.parent.addChild(corn); // Add corn to the same container as the bat
    this.off('pointerdown', onClick);
}

function gameLoop(delta){
      //Runs the current game `state` in a loop and renders the sprites

    state(delta);
    
    }   
function play(delta){
      //All the game logic goes here

    health -=0.5*delta;

outerBar.height=health;
outerBar.y=328-health;
if(health<=0){
    state=end;
    
}    
    
function end(){
    gameScene.visible=false;
    gameOverScene.visible=true;
    GameoverText.visible=true;
    console.log("Game OVER!");
    app.ticker.stop();}
    }    

