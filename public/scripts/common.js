function completeStage(stageNo) {
    let form = document.createElement('form');
    form.setAttribute('action', `/game/complete/${stageNo}`);
    form.setAttribute('method', 'GET');
    document.body.appendChild(form);
    form.submit();
}

function sendGetRequest(uri, func, func_timeout) {
    let request = new XMLHttpRequest();
    request.open('GET', uri);

    if (func_timeout) {
        request.timeout = 5000;
        request.addEventListener('timeout', func_timeout);
    }

    let processed = false;
    request.onload = () => {
        if (request.readyState == 4 && !processed) {
            if (request.status == 200) {
                let data = JSON.parse(this.responseText);
                func(data);
                processed = true;
            }
        } else {
            console.log(`Error: ${request.status}`)
        }
    }
}

function sendPostRequest(uri, json, func) {
    let request = new XMLHttpRequest();
    request.open("POST", uri);
    request.setRequestHeader("Accept", "application/json");
    request.setRequestHeader("Content-Type", "application/json");
    request.onreadystatechange = function(e) {
        if (request.readyState == 4) {
            if (request.status == 200) {
                let data = JSON.parse(this.responseText);
                func(data);
            } else {
                console.log(`Error: ${request.status}`);
            }
        }
    }
    request.send(json)
}

function sendPutRequest(uri, json = null, func) {
    let request = new XMLHttpRequest();
    request.open("PUT", uri);
    request.setRequestHeader("Accept", "application/json");
    request.setRequestHeader("Content-Type", "application/json");
    request.onreadystatechange = function(e) {
        if (request.readyState == 4) {
            if (request.status == 200) {
                let data = JSON.parse(this.responseText);
                func(data);
            } else {
                console.log(`Error: ${request.status}`);
            }
        }
    }
    request.send(json)
}

/* global navigator */


function getMobileOS () {
    const ua = navigator.userAgent
    if (/android/i.test(ua)) {
        return "Android"
    }
    else if (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
        return "iOS"
    }
    return "Other"
}

function getPosition (options) {
    return new Promise(function (resolve, reject) {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
    })
}

async function isNearbyMuseum() {
    return await true;
    
    return await getPosition()
        .then((position) => {
            const MUSEUM = {
                latitude: 37.579347006678674,
                longitude: 126.98053362142642
            };
    
            const DEBUG = {
                latitude: 37.5411668,
                longitude: 127.0116351
            };
            const offset = 0.005; //approximitely 500m
    
            const lat = position.coords.latitude;
            const long = position.coords.longitude;
            const inLatBoundary = (DEBUG.latitude - offset <= lat && lat <= DEBUG.latitude + offset);
            const inLongBoundary = (DEBUG.longitude - offset <= long && long <= DEBUG.longitude + offset);
            
            if (inLatBoundary && inLongBoundary) {
                return true;
            } else {
                return false;
            }
        }).catch((err) => {
            console.log(err);
            if (err.code == 1) {
                //todo: add andriod
                if (getMobileOS() == "iOS") {
                    alert("위치정보를 허용해주세요! \n설정 - 개인정보 및 보안 - 위치 서비스 - Safari 웹사이트 를 선택후 위치 접근 허용을 '앱을 사용하는 동안' 혹은 '다음번에 묻기'를 선택해주세요.")
                } else if (getMobileOS() == "Android") {
                    // TODO: andriod alert
                } else {
                    alert("위치정보 권한이 없습니다. 브라우저의 위치 정보 사용을 허용해주세요!")
                }
            } else {
                alert("위치정보를 불러오는데 문제가 발생했습니다.")
            }
        })
} 


function showPopup(popupId) {
    const popup = document.getElementById(popupId);
    if (popup) {
        disableBackgroundMovement();
        popup.style.pointerEvents = "auto";
        popup.style.visibility = "visible";
    }
}

function hideAllPopup() {
    enableBackgroundMovement();
    const popups = document.getElementsByClassName("popup");
    for (const popup of popups) {
        popup.style.visibility = "hidden";
    }
}

function disableBackgroundMovement() {
    document.getElementById("container").style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.pointerEvents = "none";
}

function enableBackgroundMovement() {
    document.getElementById("container").style.overflow = "scroll";
    document.body.style.overflow = "scroll";
    document.body.style.pointerEvents = "auto";
}
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

function addPopup({ popupId, title, content, imgURL, buttons }, whilePopupVisible) {
    if (document.getElementById(popupId)) {
        return false;
    }
    
    disableBackgroundMovement();
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
}
