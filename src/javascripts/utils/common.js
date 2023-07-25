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
