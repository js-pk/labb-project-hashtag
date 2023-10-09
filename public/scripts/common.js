const common = {
    completeStage: function(stageNo) {
        let form = document.createElement('form');
        form.setAttribute('action', `/game/complete/${stageNo}`);
        form.setAttribute('method', 'GET');
        document.body.appendChild(form);
        form.submit();
    },
    
    showPopup: function(popupId) {
        const popup = document.getElementById(popupId);
        if (popup) {
            common.disableBackgroundMovement();
            popup.style.pointerEvents = "auto";
            popup.style.visibility = "visible";
        }
    },
    
    hideAllPopup: function() {
        common.enableBackgroundMovement();
        const popups = document.getElementsByClassName("popup");
        for (const popup of popups) {
            popup.style.visibility = "hidden";
        }
    },
    
    disableBackgroundMovement: function() {
        document.getElementById("container").style.overflow = "hidden";
        document.body.style.overflow = "hidden";
        document.body.style.pointerEvents = "none";
    },
    
    enableBackgroundMovement: function() {
        document.getElementById("container").style.overflow = "scroll";
        document.body.style.overflow = "scroll";
        document.body.style.pointerEvents = "auto";
    },
    // {
    //     popupId: "id (필수)",
    //     title: "상단 헤더 텍스트",
    //     content: "줄글로 들어갈 텍스트",
    //     imgURL: "중앙에 들어갈 이미지 URL",
    //     buttons: [
    //         {
    //             title: "버튼 타이틀",
    //             onclick: function
    //         },
    //         {
    //             title: "버튼 타이틀",
    //             onclick: function
    //         },
    //     ]
    // }
    
    addPopup: function({ popupId, title, content, imgURL, buttons }, whilePopupVisible) {
        if (document.getElementById(popupId)) {
            return false;
        }
        
        common.disableBackgroundMovement();
        whilePopupVisible ? whilePopupVisible() : null;
        const popup = document.createElement("div");
        popup.classList.add("popup");
        popup.id = popupId;
        popup.style.pointerEvents = 'auto';
        
        if (title) {
            const titleElement = document.createElement("h3");
            const titleText = document.createTextNode(title);
            titleElement.appendChild(titleText);
            popup.appendChild(titleElement);
        }
        if (content) {
            const contentElement = document.createElement("p");
            contentElement.classList.add("content");
            const contentText = document.createTextNode(content);
            contentElement.appendChild(contentText);
            popup.appendChild(contentElement);
        } else if (imgURL) {
            const img = document.createElement("img");
            img.classList.add("image");
            img.src = imgURL;
            popup.appendChild(img);
        }
        
        const buttonContainer = document.createElement("div");
        buttonContainer.classList.add("button-container");
        buttons.forEach(button => {
            const buttonElement = document.createElement("button");
            const buttonText = document.createTextNode(button.title);
            buttonElement.appendChild(buttonText);
            buttonElement.onclick = button.onclick;
            buttonContainer.appendChild(buttonElement);
        })
        popup.appendChild(buttonContainer);
        
        document.body.appendChild(popup);
    },
    
    redirectWithSound: function(soundUrl, redirectUrl) {
        let startSound = new Howl({
            src: [soundUrl],
            onend: () => {
                window.location.href = redirectUrl;
            }
        });
        startSound.play();
    }
}


// function sendGetRequest(uri, func, func_timeout) {
//     let request = new XMLHttpRequest();
//     request.open('GET', uri);

//     if (func_timeout) {
//         request.timeout = 5000;
//         request.addEventListener('timeout', func_timeout);
//     }

//     let processed = false;
//     request.onload = () => {
//         if (request.readyState == 4 && !processed) {
//             if (request.status == 200) {
//                 let data = JSON.parse(this.responseText);
//                 func(data);
//                 processed = true;
//             }
//         } else {
//             console.log(`Error: ${request.status}`)
//         }
//     }
// }

// function sendPostRequest(uri, json, func) {
//     let request = new XMLHttpRequest();
//     request.open("POST", uri);
//     request.setRequestHeader("Accept", "application/json");
//     request.setRequestHeader("Content-Type", "application/json");
//     request.onreadystatechange = function(e) {
//         if (request.readyState == 4) {
//             if (request.status == 200) {
//                 let data = JSON.parse(this.responseText);
//                 func(data);
//             } else {
//                 console.log(`Error: ${request.status}`);
//             }
//         }
//     }
//     request.send(json)
// }

// function sendPutRequest(uri, json = null, func) {
//     let request = new XMLHttpRequest();
//     request.open("PUT", uri);
//     request.setRequestHeader("Accept", "application/json");
//     request.setRequestHeader("Content-Type", "application/json");
//     request.onreadystatechange = function(e) {
//         if (request.readyState == 4) {
//             if (request.status == 200) {
//                 let data = JSON.parse(this.responseText);
//                 func(data);
//             } else {
//                 console.log(`Error: ${request.status}`);
//             }
//         }
//     }
//     request.send(json)
// }