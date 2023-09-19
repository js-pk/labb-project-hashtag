import * as PIXI from 'pixi.js';

let tutorialScene, tutorialContainer, tutorialText, tutorialSprite, tutorialStepIndex;
let endCallback;

const tutorialOneSteps = [
    { text: "어서오세요. 당신이 000 씨로군요? ▶", image: "/images/tutorial/player.png" },
    { text: "저는 농부 랩삐입니다. ▶", image: "/images/tutorial/player.png" },
    { text: "이번에 미술관에서 옥수수 농사를 지으려는데 일손이 부족합니다. ▶", image: "/images/tutorial/player.png" }
];

const tutorialTwoSteps = [
    { text: "이 옥수수 농사는 말이죠. 땀 흘릴 필요가 없어요. ▶", image: "/images/tutorial/star.png" },
    { text: "몇 번의 손가락 클릭할 힘만 있으면 가능하죠. ▶", image: "/images/tutorial/player.png" },
    { text: "옥수수 수확에 성공하면 ‘콘코인’을 얻을 수 있습니다. ▶", image: "/images/tutorial/star.png" }
];

const combinedTutorialSteps = [...tutorialOneSteps, ...tutorialTwoSteps];

export function createTutorial(appStage) {
    tutorialScene = new PIXI.Container();
    tutorialContainer = new PIXI.Container();
    tutorialText = new PIXI.Text("", { fontFamily: 'Arial', fontSize: 24, fill: 0xff1010, align: 'center' });
    tutorialSprite = new PIXI.Sprite(PIXI.Texture.from("/images/tutorial/star.png"));

    tutorialContainer.addChild(tutorialSprite);
    tutorialContainer.addChild(tutorialText);

    tutorialScene.addChild(tutorialContainer);
    appStage.addChild(tutorialScene);
}

export function startTutorial(callback) {
    endCallback = callback;
    tutorialStepIndex = 0;
    updateTutorialStep();
    tutorialContainer.visible = true;
    tutorialScene.interactive = true;  // Ensure the tutorialScene is interactive
    tutorialScene.on("pointerdown", advanceTutorial);
}

function updateTutorialStep() {
    if (tutorialStepIndex < combinedTutorialSteps.length) {
        const step = combinedTutorialSteps[tutorialStepIndex];
        tutorialText.text = step.text;

        if(step.image) {
            tutorialSprite.texture = PIXI.Texture.from(step.image);
        }

        // Positioning (adjust as needed)
        tutorialText.x = (tutorialScene.width - tutorialText.width) / 2;
        tutorialText.y = (tutorialScene.height - tutorialText.height) / 2;
        tutorialSprite.x = (tutorialScene.width - tutorialSprite.width) / 2;
        tutorialSprite.y = (tutorialScene.height - tutorialSprite.height) / 2;
    } else {
        endTutorial();
    }
}

function advanceTutorial() {
    tutorialStepIndex++;
    updateTutorialStep();
}

function endTutorial() {
    tutorialScene.off("pointerdown", advanceTutorial);
    tutorialContainer.visible = false;
    tutorialScene.parent.removeChild(tutorialScene);
    
    if(endCallback) endCallback();
}
