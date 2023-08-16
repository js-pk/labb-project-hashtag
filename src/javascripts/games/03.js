
import * as THREE from 'three';
import {MindARThree} from 'mind-ar/dist/mindar-face-three.prod.js';

const mindarThree = new MindARThree({
    container: document.querySelector("#container"),
});

let cap = false;
const {renderer, scene, camera} = mindarThree;

const light = new THREE.HemisphereLight( 0xffffff, 0xbbbbff, 1 );
scene.add(light);
const faceMesh = mindarThree.addFaceMesh();
const texture = new THREE.TextureLoader().load('https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.2/examples/face-tracking/assets/canonical_face_model_uv_visualization.png');
faceMesh.material.map = texture;
faceMesh.material.transparent = true;
faceMesh.material.needsUpdate = true;
scene.add(faceMesh);

const startARCamera = async() => {
  await mindarThree.start();
  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
    if (cap) {
      capture();
    }
    cap = false
  });
}
startARCamera();

function triggerCapture() {
  cap = true;
}

function capture() {
  const canvas = document.createElement("canvas");
  const video = document.querySelector("video");

  canvas.width = video.clientWidth*2;
  canvas.height = video.clientHeight*2;
  
  video.pause();
  let top = window.getComputedStyle(video).getPropertyValue('top');
  canvas.getContext('2d').drawImage(video, 0, parseFloat(top), canvas.width, canvas.height);

  let arImgData = renderer.domElement.toDataURL();
  let img = new Image();
  img.onload = function() {
    canvas.getContext('2d').drawImage(this, 0, 0, this.width, this.height, 0, 0, this.width, this.height);
    // downloadImage(canvas);
    uploadImage(canvas);
    video.play();
  }
  img.src = arImgData;
}

function downloadImage(canvas) {
  if (window.navigator.msSaveOrOpenBlob) {
    let blob = canvas.msToBlob();
    window.navigator.msSaveOrOpenBlob(blob, 'download.png');
  } else {
    let a = document.createElement('a');
    a.href = canvas.toDataURL("image/png");
    a.download = 'download.png';
    a.click();
  }
}

function uploadImage(canvas) {
  const formData = new FormData();
  canvas.toBlob(async (b) => {
    try {
      formData.append("image", b, "filename.png");
      const response = await fetch("/game/upload", {
        method: "POST",
        body: formData
      });
      if (response && response.status === 200) {
        console.log(getFileName());
      }
    } catch (error) {
      console.log("error");
    }
    
  });
}

document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("capture").addEventListener("click", triggerCapture)
})


