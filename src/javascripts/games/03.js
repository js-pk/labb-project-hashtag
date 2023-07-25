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
const start = async() => {
  await mindarThree.start();
  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
    if (cap) {
      // var b = document.createElement('a');
      // b.href = renderer.domElement.toDataURL();
      // b.download = 'download_three.png';
      // b.click();
      const canvas = document.createElement("canvas");
      const video = document.getElementsByTagName("video")[0];
      const ar = renderer.getContext()
      video.pause();

      let v_width = video.clientWidth*2;
      let v_height = video.clientHeight*2;
      
      canvas.width = v_width;
      canvas.height = v_height;

      let element = document.querySelector('video'),
          style = window.getComputedStyle(element),
          top = style.getPropertyValue('top');

      canvas.getContext('2d').drawImage(video, 0, parseFloat(top), v_width, v_height);

      let arImgData = renderer.domElement.toDataURL()
      let img = new Image()
      img.onload = function() {
        canvas.getContext('2d').drawImage(this, 0, 0, this.width, this.height, 0, 0, v_width, v_height)

        if (window.navigator.msSaveOrOpenBlob) {
          var blobObject = canvas.msToBlob();
          window.navigator.msSaveOrOpenBlob(blobObject, 'download.png');
        } else {
          var a = document.createElement('a');
          a.href = canvas.toDataURL("image/png");
          a.download = 'download.png';
          a.click();
        }

        document.querySelector("video").play();
      }
      img.src = arImgData

      
    }
    cap = false
  });
}
start();


function capture() {
  cap = true
}

document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("capture").addEventListener("click", capture)
})


